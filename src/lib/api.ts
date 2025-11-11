const DEFAULT_API_ORIGIN = 'https://unitime-be.onrender.com';

const cleanEnvOrigin = import.meta.env.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')
  : undefined;

const isDevelopment = import.meta.env.DEV;

const API_BASE_URL = (() => {
  if (cleanEnvOrigin) {
    return cleanEnvOrigin.endsWith('/api')
      ? cleanEnvOrigin
      : `${cleanEnvOrigin}/api`;
  }

  if (isDevelopment) {
    return '/api';
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    const isLocalHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local');

    if (!isLocalHost) {
      return '/api';
    }
  }

  return `${DEFAULT_API_ORIGIN}/api`;
})();

type Maybe<T> = T | null | undefined;

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  department: string;
  grade: number;
  studentId: string;
  graduation_year: string;
}

export interface SignupResponse {
  message?: string;
  userId?: number;
  user?: {
    userId?: number;
    email: string;
    name: string;
    studentId: string;
    department: string;
    grade: number;
    graduation_year: string;
    plan?: 'free' | 'premium';
  };
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  userId?: number;
  user?: {
    userId?: number;
    email: string;
    name: string;
    studentId: string;
    department: string;
    grade: number;
    graduation_year: string;
    plan?: 'free' | 'premium';
  };
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
}

export interface LogoutResponse {
  message?: string;
}

export interface ProfileResponse {
  userId: number;
  name: string;
  studentId: string;
  department: string;
  grade: number;
  graduationYear: number | null;
  email?: string;
  plan?: 'free' | 'premium';
}

export interface UpdateProfileRequest {
  name: string;
  studentId: string;
  department: string;
  grade: number;
  graduationYear: number | null;
}

export interface ChatHistoryItem {
  id: number;
  userId: number;
  role: string;
  content: string;
  conversationId?: string;
  createdAt: string;
}

export interface SendChatRequest {
  userId: number;
  message: string;
  conversationId?: string;
}

export interface SendChatResponse {
  conversationId?: string;
  message?: string;
  reply?: ChatHistoryItem;
  created?: ChatHistoryItem;
  messages?: ChatHistoryItem[];
  data?: ChatHistoryItem[];
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  status?: number;
  message?: string;
  error?: string;
  errors?: ApiFieldError[];
  raw?: unknown;
}

const storageAvailable =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const ACCESS_TOKEN_KEY = 'accessToken';
const COMPAT_AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenStorage = {
  getAccessToken: (): Maybe<string> => {
    if (!storageAvailable) return null;
    return (
      window.localStorage.getItem(ACCESS_TOKEN_KEY) ??
      window.localStorage.getItem(COMPAT_AUTH_TOKEN_KEY)
    );
  },
  getRefreshToken: (): Maybe<string> => {
    if (!storageAvailable) return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens: (accessToken?: string, refreshToken?: string) => {
    if (!storageAvailable) return;
    if (accessToken) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      window.localStorage.setItem(COMPAT_AUTH_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clearTokens: () => {
    if (!storageAvailable) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(COMPAT_AUTH_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

function createFetchOptions(
  method: string,
  body?: unknown,
  requiresAuth = false,
): RequestInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (requiresAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  if (!isDevelopment || cleanEnvOrigin) {
    options.mode = 'cors';
  }

  return options;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json') ?? false;
  const text = await response.text();

  let parsed: unknown = text;
  if (isJson && text) {
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ JSON Parse Error', { parseError, text: text.slice(0, 500) });
    }
  }

  if (!response.ok) {
    const error: ApiError =
      parsed && typeof parsed === 'object'
        ? { ...(parsed as Record<string, unknown>) }
        : { message: typeof parsed === 'string' ? parsed : undefined };

    error.status = response.status;
    error.raw = parsed;

    if (!error.message) {
      if (response.status === 500) {
        error.message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (response.status === 404) {
        error.message = '요청한 리소스를 찾을 수 없습니다.';
      } else {
        error.message = `요청이 실패했습니다. (status: ${response.status})`;
      }
    }

    throw error;
  }

  return (parsed as T) ?? ({} as T);
}

function normaliseUser(
  data: Maybe<LoginResponse['user'] | SignupResponse['user']>,
) {
  if (!data) return undefined;
  return {
    userId: (data as any).userId ?? (data as any).id ?? undefined,
    email: data.email,
    name: data.name,
    studentId: data.studentId,
    department: data.department,
    grade: data.grade,
    graduation_year: data.graduation_year,
    plan: data.plan ?? 'free',
  };
}

export async function signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/signup`,
    createFetchOptions('POST', data),
  );
  const result = await handleResponse<SignupResponse>(response);

  if (result.token || result.accessToken) {
    tokenStorage.setTokens(result.accessToken ?? result.token, result.refreshToken);
  }

  if (result.user) {
    result.user = normaliseUser(result.user);
  }

  return result;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    createFetchOptions('POST', data),
  );
  const result = await handleResponse<LoginResponse>(response);

  if (result.token || result.accessToken) {
    tokenStorage.setTokens(result.accessToken ?? result.token, result.refreshToken);
  }

  if (result.user) {
    result.user = normaliseUser(result.user);
  }

  return result;
}

export async function logout(): Promise<LogoutResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/logout`,
    createFetchOptions('POST', undefined, true),
  );
  const result = await handleResponse<LogoutResponse>(response);
  tokenStorage.clearTokens();
  return result;
}

export async function refreshToken(
  data: RefreshTokenRequest,
): Promise<RefreshTokenResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/refresh`,
    createFetchOptions('POST', data),
  );
  const result = await handleResponse<RefreshTokenResponse>(response);

  if (result.accessToken || result.token) {
    tokenStorage.setTokens(result.accessToken ?? result.token, result.refreshToken);
  }

  return result;
}

export async function getProfile(): Promise<ProfileResponse> {
  const response = await fetch(
    `${API_BASE_URL}/users/me`,
    createFetchOptions('GET', undefined, true),
  );
  return handleResponse<ProfileResponse>(response);
}

export async function updateProfile(
  data: UpdateProfileRequest,
): Promise<ProfileResponse> {
  const attempt = async (path: string) => {
    const response = await fetch(
      `${API_BASE_URL}/${path}`,
      createFetchOptions('PATCH', data, true),
    );
    return handleResponse<ProfileResponse>(response);
  };

  try {
    return await attempt('users/me');
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 404) {
      return attempt('uesrs/me'); // fallback for potential backend typo
    }
    throw error;
  }
}

export async function sendChatMessage(
  data: SendChatRequest,
): Promise<SendChatResponse> {
  const response = await fetch(
    `${API_BASE_URL}/chat`,
    createFetchOptions('POST', data, true),
  );
  return handleResponse<SendChatResponse>(response);
}

export async function getChatHistory(
  userId: number,
): Promise<ChatHistoryItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/chat/history/${userId}`,
    createFetchOptions('GET', undefined, true),
  );
  const result = await handleResponse<ChatHistoryItem[] | { data?: ChatHistoryItem[] }>(response);
  if (Array.isArray(result)) return result;
  return result.data ?? [];
}

export async function deleteChatHistory(
  userId: number,
): Promise<{ message?: string }> {
  const response = await fetch(
    `${API_BASE_URL}/chat/history/${userId}`,
    createFetchOptions('DELETE', undefined, true),
  );
  return handleResponse<{ message?: string }>(response);
}

