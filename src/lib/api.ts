import { AccessTokenResponse, ChatSetting, Conversation } from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// APIエラーハンドリング用のクラス
export class ApiErrorClass extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// 共通のfetch関数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('[DEBUG] API Request:', {
    url,
    method: options.method || 'GET',
    hasBody: !!options.body,
    timestamp: new Date().toISOString(),
    apiBaseUrl: API_BASE_URL
  });
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('[DEBUG] API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      throw new ApiErrorClass(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    console.log('[DEBUG] API Response Data:', {
      url,
      dataKeys: Object.keys(data),
      timestamp: new Date().toISOString()
    });

    return data;
  } catch (error) {
    console.error('[DEBUG] API Error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// 010. アクセストークン取得
export async function getAccessToken(
  identifier: string,
  fingerprint: string
): Promise<AccessTokenResponse> {
  return apiRequest<AccessTokenResponse>(`/spaces/${identifier}/access_tokens`, {
    method: 'POST',
    body: JSON.stringify({
      identifier,
      fingerprint,
    }),
  });
}

// 020. Chat設定取得
export async function getChatSetting(
  identifier: string,
  accessToken: string
): Promise<ChatSetting> {
  return apiRequest<ChatSetting>(`/spaces/${identifier}/chat_setting`, {
    method: 'GET',
    headers: {
      'X-Authorization': accessToken,
    },
  });
}

// 030. 会話作成
export async function createConversation(
  identifier: string,
  content: string,
  accessToken: string
): Promise<Conversation> {
  return apiRequest<Conversation>(`/spaces/${identifier}/conversations`, {
    method: 'POST',
    headers: {
      'X-Authorization': accessToken,
    },
    body: JSON.stringify({
      identifier,
      content,
    }),
  });
}

// 040. 会話情報取得
export async function getConversation(
  identifier: string,
  token: string,
  accessToken: string
): Promise<Conversation> {
  return apiRequest<Conversation>(`/spaces/${identifier}/conversations/${token}`, {
    method: 'GET',
    headers: {
      'X-Authorization': accessToken,
    },
  });
}

// 050. 返信
export async function replyToConversation(
  identifier: string,
  token: string,
  content: string,
  accessToken: string
): Promise<Conversation> {
  return apiRequest<Conversation>(`/spaces/${identifier}/conversations/${token}/reply`, {
    method: 'POST',
    headers: {
      'X-Authorization': accessToken,
    },
    body: JSON.stringify({
      token,
      identifier,
      content,
    }),
  });
}

// 060. 評価
export async function rateConversation(
  identifier: string,
  token: string,
  ratingTypeId: number,
  accessToken: string
): Promise<void> {
  return apiRequest<void>(`/spaces/${identifier}/conversations/${token}/rating`, {
    method: 'PUT',
    headers: {
      'X-Authorization': accessToken,
    },
    body: JSON.stringify({
      token,
      identifier,
      rating_type_id: ratingTypeId,
    }),
  });
}
