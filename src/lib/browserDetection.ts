/**
 * ブラウザとOSバージョン検出ユーティリティ
 */

interface DeviceInfo {
  isIOS: boolean;
  iOSVersion: number | null;
  isSupported: boolean;
}

/**
 * iOSバージョンを検出
 * @returns iOSバージョン番号（null if not iOS）
 */
function detectIOSVersion(): number | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null;
  }

  const userAgent = navigator.userAgent;
  
  // iPhone/iPad/iPod の検出
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  if (!isIOS) {
    return null;
  }

  // iOS バージョンの検出
  const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
  if (match) {
    const majorVersion = parseInt(match[1], 10);
    return majorVersion;
  }

  // CriOS (Chrome for iOS) の場合
  const chromeMatch = userAgent.match(/CriOS\/(\d+)\./);
  if (chromeMatch) {
    // Chrome バージョンからおおよそのiOSバージョンを推定する場合もあるが、
    // 正確なiOSバージョンが取得できない場合はnullを返す
    return null;
  }

  return null;
}

/**
 * デバイスがサポート対象かどうかを判定
 * @param minIOSVersion 最小サポートiOSバージョン（デフォルト: 14）
 * @returns デバイス情報
 */
export function checkDeviceSupport(minIOSVersion: number = 14): DeviceInfo {
  const userAgent = getUserAgentString();
  console.log('[BrowserDetection] User Agent:', userAgent);
  
  const iOSVersion = detectIOSVersion();
  const isIOS = iOSVersion !== null;
  
  console.log('[BrowserDetection] Device detection result:', {
    isIOS,
    iOSVersion,
    minIOSVersion
  });
  
  // iOS以外のデバイスは全てサポート
  if (!isIOS) {
    const result = {
      isIOS: false,
      iOSVersion: null,
      isSupported: true
    };
    console.log('[BrowserDetection] Non-iOS device, returning:', result);
    return result;
  }

  // iOSバージョンが検出できなかった場合はサポート外とする
  if (iOSVersion === null) {
    const result = {
      isIOS: true,
      iOSVersion: null,
      isSupported: false
    };
    console.log('[BrowserDetection] iOS detected but version unknown, returning:', result);
    return result;
  }

  // バージョンチェック
  const isSupported = iOSVersion >= minIOSVersion;
  
  const result = {
    isIOS: true,
    iOSVersion,
    isSupported
  };
  
  console.log('[BrowserDetection] iOS version check complete:', {
    ...result,
    versionComparison: `iOS ${iOSVersion} ${isSupported ? '>=' : '<'} ${minIOSVersion}`
  });
  
  return result;
}

/**
 * ユーザーエージェント文字列を取得（デバッグ用）
 */
export function getUserAgentString(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'Unknown (Server Side)';
  }
  return navigator.userAgent;
}