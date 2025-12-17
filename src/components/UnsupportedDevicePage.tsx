'use client';

import React from 'react';
import { getUserAgentString } from '../lib/browserDetection';

interface UnsupportedDevicePageProps {
  minIOSVersion?: number;
  customTitle?: string;
  customMessage?: string;
}

const UnsupportedDevicePage: React.FC<UnsupportedDevicePageProps> = ({
  minIOSVersion = 14,
  customTitle,
  customMessage
}) => {
  const defaultTitle = 'ご利用の環境はサポートされていません';
  const defaultMessage = `このサービスをご利用いただくには、iOS ${minIOSVersion}以降が必要です。最新のiOSにアップデートしてから再度お試しください。`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '24px',
          marginBottom: '20px',
          color: '#333'
        }}>
          {customTitle || defaultTitle}
        </h1>
        
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#666',
          marginBottom: '30px'
        }}>
          {customMessage || defaultMessage}
        </p>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#999'
        }}>
          <p>推奨環境:</p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '10px 0 0 0'
          }}>
            <li>iOS {minIOSVersion}以降</li>
            <li>最新版のSafari、Chrome</li>
          </ul>
        </div>
        
        {/* デバッグ情報（開発環境のみ表示する場合は条件を追加） */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666',
            wordBreak: 'break-all'
          }}>
            <p>User Agent: {getUserAgentString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnsupportedDevicePage;