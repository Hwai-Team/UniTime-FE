// API layer: 개발에서는 Vite 프록시(/api), 배포에서는 절대 URL 사용
const API_BASE = import.meta.env.PROD ? 'https://unitime-be.onrender.com' : '/api';

// ========== Simple auth token store (access + refresh) ==========
type TokenPair = { accessToken?: string; refreshToken?: string };
let tokens: TokenPair = {
	accessToken: (typeof localStorage !== 'undefined' && localStorage.getItem('accessToken')) || undefined,
	refreshToken: (typeof localStorage !== 'undefined' && localStorage.getItem('refreshToken')) || undefined,
};

function setAuthTokens(next: TokenPair) {
	tokens = {
		accessToken: next.accessToken ?? tokens.accessToken,
		refreshToken: next.refreshToken ?? tokens.refreshToken,
	};
	if (typeof localStorage !== 'undefined') {
		if (tokens.accessToken) localStorage.setItem('accessToken', tokens.accessToken);
		if (tokens.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);
	}
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string> | undefined),
	};
	if (tokens.accessToken) {
		headers.Authorization = `Bearer ${tokens.accessToken}`;
	}

	const res = await fetch(`${API_BASE}${path}`, {
		headers,
		credentials: 'include',
		...options,
	});

	if (res.status === 401 || res.status === 403) {
		// try refresh once
		if (retry && tokens.refreshToken) {
			try {
				const refreshed = await refreshToken({ refreshToken: tokens.refreshToken });
				// attempt to pick token fields commonly used
				const newAccess =
					(refreshed as any).accessToken || (refreshed as any).access_token || (refreshed as any).token;
				const newRefresh = (refreshed as any).refreshToken || (refreshed as any).refresh_token;
				setAuthTokens({ accessToken: newAccess, refreshToken: newRefresh });
				return request<T>(path, options, false);
			} catch {
				// fallthrough to throw original error
			}
		}
	}

	// 204 No Content는 성공 응답이지만 body가 없으므로 먼저 처리
	if (res.status === 204) {
		return undefined as T;
	}
	
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		const error = new Error(text || `HTTP ${res.status}`) as Error & { status?: number };
		error.status = res.status;
		throw error;
	}
	
	// Content-Length가 0이거나 body가 없는 경우도 처리
	const contentLength = res.headers.get('content-length');
	if (contentLength === '0') {
		return undefined as T;
	}
	
	// body가 있는 경우에만 JSON 파싱 시도
	try {
		const text = await res.text();
		// 빈 body인 경우
		if (!text || text.trim() === '') {
			return undefined as T;
		}
		// JSON 파싱 시도
		return JSON.parse(text) as T;
	} catch (parseError) {
		// JSON 파싱 실패 시 (예: HTML 에러 페이지 등)
		// 빈 응답으로 처리하거나 원본 텍스트를 포함한 에러를 던질 수도 있음
		console.warn('Failed to parse JSON response:', parseError);
		return undefined as T;
	}
}

// ==================== Auth APIs ====================
export interface SignupRequest {
	email: string;
	password: string;
	name: string;
	department: string;
	grade: number;
	studentId: string;
}
export interface LoginRequest {
	email: string;
	password: string;
}
export interface RefreshRequest {
	refreshToken: string;
}

export async function signup(body: SignupRequest) {
	const result = await request('/auth/signup', { method: 'POST', body: JSON.stringify(body) });
	// 저장 가능한 토큰이 있으면 보관
	const access = (result as any).accessToken || (result as any).access_token;
	const refresh = (result as any).refreshToken || (result as any).refresh_token;
	if (access || refresh) setAuthTokens({ accessToken: access, refreshToken: refresh });
	return result;
}

export async function login(body: LoginRequest) {
	const result = await request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
	const access = (result as any).accessToken || (result as any).access_token;
	const refresh = (result as any).refreshToken || (result as any).refresh_token;
	if (access || refresh) setAuthTokens({ accessToken: access, refreshToken: refresh });
	return result;
}

export async function refreshToken(body: RefreshRequest) {
	return request('/auth/refresh', { method: 'POST', body: JSON.stringify(body) });
}

export async function logout() {
	const res = await request('/auth/logout', { method: 'POST' });
	// 로그아웃 시 토큰 제거
	setAuthTokens({ accessToken: undefined, refreshToken: undefined });
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
	}
	return res;
}

// ==================== Profile APIs ====================
export interface MyProfileResponse {
	userId: number;
	name: string;
	studentId: string;
	department: string;
	grade: number;
	graduationYear: number;
}

export async function getMyProfile() {
	return request<MyProfileResponse>('/users/me', { method: 'GET' });
}

export interface UpdateMyProfileRequest {
	name: string;
	studentId: string;
	department: string;
	grade: number;
	graduationYear: number;
}

export async function updateMyProfile(body: UpdateMyProfileRequest) {
	return request<MyProfileResponse>('/users/me', {
		method: 'PATCH',
		body: JSON.stringify(body),
	});
}

// ==================== Courses Search ====================
export interface CourseItem {
	id: number;
	courseCode: string;
	name: string;
	gradeYear: number | null;
	category: string; // 전선/전필/교선/교필
	credit: number;
	dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
	startPeriod: number;
	endPeriod: number;
	professor: string;
	room: string;
	section: string;
}

export interface SearchCoursesParams {
	gradeYear?: number;
	category?: string;
	keyword?: string;
}

export async function searchCourses(params: SearchCoursesParams = {}) {
	const qs = new URLSearchParams();
	if (typeof params.gradeYear === 'number') qs.set('gradeYear', String(params.gradeYear));
	if (params.category) qs.set('category', params.category);
	if (params.keyword) qs.set('keyword', params.keyword);
	const query = qs.toString();
	return request<CourseItem[]>(`/courses${query ? `?${query}` : ''}`, { method: 'GET' });
}

// ==================== Course Taken Flag ====================
export interface UpdateCourseTakenRequest {
	userId: number;
	taken: boolean;
}
export interface UpdateCourseTakenResponse {
	courseId: number;
	userId: number;
	taken: boolean;
}

export async function updateCourseTaken(courseId: number, body: UpdateCourseTakenRequest) {
	return request<UpdateCourseTakenResponse>(`/courses/${courseId}/taken`, {
		method: 'PATCH',
		body: JSON.stringify(body),
	});
}

export async function getTakenCourses(userId: number) {
	const qs = new URLSearchParams({ userId: String(userId) });
	return request<number[]>(`/courses/taken?${qs.toString()}`, { method: 'GET' });
}

// ==================== Timetables ====================
export interface CreateTimetableRequest {
	year: number;
	semester: number;
	title: string;
}
export interface TimetableItemResponse {
	id: number;
	courseId: number;
	credit: number;
	professor: string;
	courseName: string;
	dayOfWeek: string;
	startPeriod: number;
	endPeriod: number;
	room: string;
	category: string;
	recommendedGrade: number;
}
export interface TimetableResponse {
	id: number;
	year: number;
	semester: number;
	title: string;
	items: TimetableItemResponse[];
}

export async function createTimetable(userId: number, body: CreateTimetableRequest) {
	const qs = new URLSearchParams({ userId: String(userId) });
	return request<TimetableResponse>(`/timetables?${qs.toString()}`, {
		method: 'POST',
		body: JSON.stringify(body),
	});
}

export interface UpdateTimetableRequest {
	title?: string;
	items?: Array<{ courseId: number }>;
}

export async function updateTimetable(timetableId: number, body: UpdateTimetableRequest) {
	return request<TimetableResponse>(`/timetables/${timetableId}`, {
		method: 'PUT',
		body: JSON.stringify(body),
	});
}

export async function deleteTimetable(timetableId: number) {
	return request<void>(`/timetables/${timetableId}`, { method: 'DELETE' });
}

export async function getMyTimetables(userId: number) {
	const qs = new URLSearchParams({ userId: String(userId) });
	return request<TimetableResponse[]>(`/timetables/me?${qs.toString()}`, { method: 'GET' });
}

export interface UploadResponse {
	success: boolean;
	data?: {
		courses: Array<{
			category: string; // 예: '전필' | '전선' | '교양'
			dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
			startPeriod: number;
			endPeriod: number;
			courseName: string;
			courseId: string | number;
			room?: string;
			credits?: number;
		}>;
	};
	error?: string;
}

export async function uploadTimetableImage(_file: File): Promise<UploadResponse> {
	// NOTE: 이미지 인식 백엔드가 없으므로 데모용 더미 데이터를 반환합니다.
	// 실제 구현 시, 서버 업로드 및 분석 API 호출로 교체하세요.
	await new Promise((r) => setTimeout(r, 600));

	return {
		success: true,
		data: {
			courses: [
				{
					category: '전필',
					dayOfWeek: 'MON',
					startPeriod: 21,
					endPeriod: 22,
					courseName: '자료구조',
					courseId: 'CS201',
					room: 'IT-301',
					credits: 3,
				},
				{
					category: '전선',
					dayOfWeek: 'WED',
					startPeriod: 23,
					endPeriod: 23,
					courseName: '데이터베이스',
					courseId: 'CS303',
					room: 'IT-205',
					credits: 3,
				},
				{
					category: '교양',
					dayOfWeek: 'FRI',
					startPeriod: 3,
					endPeriod: 3,
					courseName: '영어회화',
					courseId: 'ENG101',
					room: '본-201',
					credits: 2,
				},
			],
		},
	};
}

// ==================== Chat ====================
export interface ChatRequest {
	userId: number;
	message: string;
}
export interface ChatResponse {
	reply: string;
	conversationId: string | null;
	timetablePlan: boolean;
	plan: any;
}

export async function sendChatMessage(body: ChatRequest) {
	return request<ChatResponse>('/chat', { method: 'POST', body: JSON.stringify(body) });
}

export async function getChatHistory(userId: number) {
	return request<Array<{ id: number; userId: number; role: 'USER' | 'ASSISTANT'; content: string; createdAt: string }>>(
		`/chat/history/${userId}`,
		{ method: 'GET' },
	);
}

export async function deleteChatHistory(userId: number) {
	return request<void>(`/chat/history/${userId}`, { method: 'DELETE' });
}

// ==================== AI Timetable ====================
export interface AIGenerateButtonVisibilityRequest {
	userId: number;
	lastUserMessage: string;
	recentUserMessages: string[];
}
export interface AIGenerateButtonVisibilityResponse {
	visible: boolean;
	reason?: string;
	suggestionText?: string;
	timetableContextMsg?: string;
}
export async function getAIGenerateButtonVisibility(body: AIGenerateButtonVisibilityRequest) {
	return request<AIGenerateButtonVisibilityResponse>('/timetables/ai-generate/button-visibility', {
		method: 'POST',
		body: JSON.stringify(body),
	});
}

export interface AIGenerateTimetableRequest {
	userId: number;
	message: string;
	year: number;
	semester: number; // 1 | 2
}
export interface AIGenerateTimetableResponse {
	id: number;
	title: string;
	year: number;
	semester: number;
	items: Array<{
		courseName: string;
		dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
		startPeriod: number;
		endPeriod: number;
		room: string;
		category: string;
	}>;
}
export async function generateAITimetable(body: AIGenerateTimetableRequest) {
	return request<AIGenerateTimetableResponse>('/timetables/ai', {
		method: 'POST',
		body: JSON.stringify(body),
	});
}

export interface SaveAITimetableRequest {
	userId: number;
	timetableId: number;
	resultSummary: string;
}
export interface AITimetableResponse {
	id: number;
	userId: number;
	timetableId: number;
	prompt: string;
	title: string;
	userName: string;
	message: string;
	resultSummary: string;
	createdAt: string;
	items: Array<{
		id: number;
		courseId: number;
		credit: number;
		professor: string;
		courseName: string;
		dayOfWeek: string;
		startPeriod: number;
		endPeriod: number;
		room: string;
		category: string;
		recommendedGrade: number;
	}>;
}
export async function saveAITimetable(body: SaveAITimetableRequest) {
	return request<AITimetableResponse>('/timetables/ai', {
		method: 'PUT',
		body: JSON.stringify(body),
	});
}

export async function getAITimetable(userId: number) {
	return request<AITimetableResponse>(`/timetables/ai?userId=${userId}`, {
		method: 'GET',
	});
}

export async function deleteAITimetable(userId: number) {
	return request<void>(`/timetables/ai?userId=${userId}`, {
		method: 'DELETE',
	});
}

export interface TimetableSummaryResponse {
	userId: number;
	summary: string;
}
export async function getTimetableSummary(userId: number) {
	return request<TimetableSummaryResponse>(`/ai/summary/timetable?userId=${userId}`, {
		method: 'GET',
	});
}

// 아래 API들은 현재 화면에서 직접 사용되지 않지만, import 오류를 방지하기 위해
// 기본 형태의 목 함수를 제공합니다.

export async function getRepresentativeTimetable() {
	await new Promise((r) => setTimeout(r, 200));
	return { success: true, data: null as any };
}

export async function getSavedTimetables() {
	await new Promise((r) => setTimeout(r, 200));
	return { success: true, data: [] as any[] };
}

export async function deleteAIGeneratedTimetable(_id: string) {
	await new Promise((r) => setTimeout(r, 200));
	return { success: true };
}


