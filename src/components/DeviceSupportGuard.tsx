'use client';

import React, { useEffect, useState } from 'react';
import { checkDeviceSupport } from '../lib/browserDetection';
import UnsupportedDevicePage from './UnsupportedDevicePage';

interface DeviceSupportGuardProps {
  children: React.ReactNode;
  minIOSVersion?: number;
  customTitle?: string;
  customMessage?: string;
}

const DeviceSupportGuard: React.FC<DeviceSupportGuardProps> = ({
  children,
  minIOSVersion = 14,
  customTitle,
  customMessage
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof checkDeviceSupport> | null>(null);

  useEffect(() => {
    console.log('[DeviceSupportGuard] Checking device support...');
    console.log('[DeviceSupportGuard] Min iOS Version required:', minIOSVersion);
    
    // クライアントサイドでのみ実行
    const info = checkDeviceSupport(minIOSVersion);
    console.log('[DeviceSupportGuard] Device check result:', info);
    
    setDeviceInfo(info);
    setIsSupported(info.isSupported);
    setIsChecking(false);
  }, [minIOSVersion]);

  // チェック中は何も表示しない（または適切なローディング表示）
  if (isChecking) {
    console.log('[DeviceSupportGuard] Still checking device...');
    return null;
  }

  // サポート対象外の場合
  if (!isSupported) {
    console.log('[DeviceSupportGuard] Device not supported! Showing unsupported page.');
    console.log('[DeviceSupportGuard] Device info:', deviceInfo);
    return (
      <UnsupportedDevicePage
        minIOSVersion={minIOSVersion}
        customTitle={customTitle}
        customMessage={customMessage}
      />
    );
  }

  // サポート対象の場合は子要素を表示
  console.log('[DeviceSupportGuard] Device supported! Rendering children.');
  return <>{children}</>;
};

export default DeviceSupportGuard;