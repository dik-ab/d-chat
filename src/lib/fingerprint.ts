/**
 * シンプルなデバイスフィンガープリント生成ユーティリティ
 */

// シンプルなハッシュ関数
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// デバイス情報を収集
function getDeviceInfo(): string {
  // ブラウザ環境チェック
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'server-side';
  }
  
  const info = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width,
    screen.height,
    screen.colorDepth,
    window.devicePixelRatio || 1,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
    'ontouchstart' in window ? 'touch' : 'no-touch'
  ].join('|');
  
  return info;
}

// メインのフィンガープリント生成関数（同期）
export function generateDeviceFingerprint(): string {
  try {
    const deviceInfo = getDeviceInfo();
    return simpleHash(deviceInfo);
  } catch (error) {
    console.error('Fingerprint generation failed:', error);
    // フォールバック：基本的な情報のみ
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const fallback = `${navigator.userAgent}-${screen.width}x${screen.height}`;
      return simpleHash(fallback);
    } else {
      // サーバーサイドの場合は固定値
      return simpleHash('server-fallback');
    }
  }
}

// ローカルストレージを使用した永続化
const FINGERPRINT_STORAGE_KEY = 'device_fingerprint';

export function getOrCreateFingerprint(): string {
  // まずローカルストレージから取得を試行
  try {
    const stored = localStorage.getItem(FINGERPRINT_STORAGE_KEY);
    if (stored) {
      return stored;
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }
  
  // 存在しない場合は新規生成
  const fingerprint = generateDeviceFingerprint();
  
  // ローカルストレージに保存
  try {
    localStorage.setItem(FINGERPRINT_STORAGE_KEY, fingerprint);
  } catch (e) {
    console.warn('Failed to store fingerprint:', e);
  }
  
  return fingerprint;
}

// フィンガープリントをリセット（デバッグ用）
export function resetFingerprint(): void {
  try {
    localStorage.removeItem(FINGERPRINT_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to reset fingerprint:', e);
  }
}
