// API layer: 개발과 배포 모두 프록시(/api) 사용 - Netlify 프록시를 통해 CORS 문제 해결
const API_BASE = '/api';

// ========== Simple auth token store (access + refresh) ==========
type TokenPair = { accessToken?: string; refreshToken?: string };
let tokens: TokenPair = {
  accessToken:
    (typeof localStorage !== 'undefined' &&
      localStorage.getItem('accessToken')) || undefined,
  refreshToken:
    (typeof localStorage !== 'undefined' &&
      localStorage.getItem('refreshToken')) || undefined,
};

function setAuthTokens(next: TokenPair) {
  tokens = {
    accessToken: next.accessToken ?? tokens.accessToken,
    refreshToken: next.refreshToken ?? tokens.refreshToken,
  };
  if (typeof localStorage !== 'undefined') {
    if (tokens.accessToken)
      localStorage.setItem('accessToken', tokens.accessToken);
    if (tokens.refreshToken)
      localStorage.setItem('refreshToken', tokens.refreshToken);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (tokens.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    // credentials는 같은 도메인에서만 필요하므로 프록시 사용 시 제거
    ...options,
  });

  if (res.status === 401 || res.status === 403) {
    // try refresh once
    if (retry && tokens.refreshToken) {
      try {
        const refreshed = await refreshToken({
          refreshToken: tokens.refreshToken,
        });
        // attempt to pick token fields commonly used
        const newAccess =
          (refreshed as any).accessToken ||
          (refreshed as any).access_token ||
          (refreshed as any).token;
        const newRefresh =
          (refreshed as any).refreshToken ||
          (refreshed as any).refresh_token;
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
    const error = new Error(text || `HTTP ${res.status}`) as Error & {
      status?: number;
    };
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
  const result = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  // 저장 가능한 토큰이 있으면 보관
  const access =
    (result as any).accessToken || (result as any).access_token;
  const refresh =
    (result as any).refreshToken || (result as any).refresh_token;
  if (access || refresh)
    setAuthTokens({ accessToken: access, refreshToken: refresh });
  return result;
}

export async function login(body: LoginRequest) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const access =
    (result as any).accessToken || (result as any).access_token;
  const refresh =
    (result as any).refreshToken || (result as any).refresh_token;
  if (access || refresh)
    setAuthTokens({ accessToken: access, refreshToken: refresh });
  return result;
}

export async function refreshToken(body: RefreshRequest) {
  return request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(body),
  });
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
  if (typeof params.gradeYear === 'number')
    qs.set('gradeYear', String(params.gradeYear));
  if (params.category) qs.set('category', params.category);
  if (params.keyword) qs.set('keyword', params.keyword);
  const query = qs.toString();
  return request<CourseItem[]>(
    `/courses${query ? `?${query}` : ''}`,
    { method: 'GET' },
  );
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

export async function updateCourseTaken(
  courseId: number,
  body: UpdateCourseTakenRequest,
) {
  return request<UpdateCourseTakenResponse>(`/courses/${courseId}/taken`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function getTakenCourses(userId: number) {
  const qs = new URLSearchParams({ userId: String(userId) });
  return request<number[]>(
    `/courses/taken?${qs.toString()}`,
    { method: 'GET' },
  );
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

export async function createTimetable(
  userId: number,
  body: CreateTimetableRequest,
) {
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

export async function updateTimetable(
  timetableId: number,
  body: UpdateTimetableRequest,
) {
  return request<TimetableResponse>(`/timetables/${timetableId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteTimetable(timetableId: number) {
  return request<void>(`/timetables/${timetableId}`, { method: 'DELETE' });
}

export async function getTimetable(timetableId: number) {
  return request<TimetableResponse>(`/timetables/${timetableId}`, {
    method: 'GET',
  });
}

export async function getMyTimetables(userId: number) {
  const qs = new URLSearchParams({ userId: String(userId) });
  return request<TimetableResponse[]>(
    `/timetables/me?${qs.toString()}`,
    { method: 'GET' },
  );
}

// ✅ 백엔드 TimetableImageImportResponse.Item 형태에 맞게 수정
export interface TimetableImageItem {
  courseId: number; // 실제 Course PK
  courseName: string; // 강의명
  courseCode: string | null; // 학수번호 (있으면)
  dayOfWeek: string; // 요일
  startPeriod: number; // 시작 교시
  endPeriod: number; // 끝 교시
  room: string | null; // 강의실
  category: string; // 전필/교양/기타
  credit: number; // 학점
}

export interface TimetableImageResponse {
  items: TimetableImageItem[];
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
      courseId: number; // ✅ 이제 항상 number (DB Course.id)
      room?: string;
      credits?: number;
    }>;
  };
  error?: string;
}

export async function uploadTimetableImage(
  file: File,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (tokens.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  try {
    const res = await fetch(`${API_BASE}/timetables/import/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `HTTP ${res.status}`);
    }

    const data: TimetableImageResponse = await res.json();

    // ✅ 백엔드에서 이미 courseId / category / credit 채워주니까 그대로 사용
    const courses = data.items.map((item) => ({
      category: item.category || '기타',
      dayOfWeek: item.dayOfWeek as
        | 'MON'
        | 'TUE'
        | 'WED'
        | 'THU'
        | 'FRI',
      startPeriod: item.startPeriod,
      endPeriod: item.endPeriod,
      courseName: item.courseName,
      courseId: item.courseId, // ← 진짜 DB Course.id
      room: item.room || '',
      credits: item.credit ?? 3, // 없으면 기본 3
    }));

    return {
      success: true,
      data: { courses },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || '이미지 업로드에 실패했습니다.',
    };
  }
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
  return request<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getChatHistory(userId: number) {
  return request<
    Array<{
      id: number;
      userId: number;
      role: 'USER' | 'ASSISTANT';
      content: string;
      createdAt: string;
    }>
  >(`/chat/history/${userId}`, { method: 'GET' });
}

export async function deleteChatHistory(userId: number) {
  return request<void>(`/chat/history/${userId}`, { method: 'DELETE' });
}

// ==================== AI Timetable ====================

// 플랜 키 타입 (A/B/C)
export type PlanKey = 'A' | 'B' | 'C';

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
export async function getAIGenerateButtonVisibility(
  body: AIGenerateButtonVisibilityRequest,
) {
  return request<AIGenerateButtonVisibilityResponse>(
    '/timetables/ai-generate/button-visibility',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export interface AIGenerateTimetableRequest {
  userId: number;
  message: string;
  year: number;
  semester: number; // 1 | 2
  planKey?: PlanKey; // 🔥 플랜 A/B/C 구분
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
    body: JSON.stringify(body), // planKey까지 같이 전달
  });
}

export interface SaveAITimetableRequest {
  userId: number;
  timetableId: number;
  resultSummary: string;
  planKey?: PlanKey; // 🔥 어떤 플랜에 저장할지
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
    body: JSON.stringify(body), // planKey 포함
  });
}

export async function getAITimetable(userId: number) {
  return request<AITimetableResponse | AITimetableResponse[]>(
    `/timetables/ai?userId=${userId}`,
    { method: 'GET' },
  );
}

export async function deleteAITimetable(userId: number, planKey?: string) {
  const qs = new URLSearchParams({ userId: String(userId) });
  if (planKey) qs.set('plan', planKey);
  return request<void>(`/timetables/ai?${qs.toString()}`, {
    method: 'DELETE',
  });
}

export interface TimetableSummaryResponse {
  userId: number;
  summary: string;
}
export async function getTimetableSummary(userId: number) {
  return request<TimetableSummaryResponse>(
    `/ai/summary/timetable?userId=${userId}`,
    { method: 'GET' },
  );
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