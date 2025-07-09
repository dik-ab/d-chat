'use client';

import React, { useState, useEffect } from 'react';
import { CompanyMessage } from '../company';

interface LoadingMessageProps {
  backgroundColor?: string;
  iconUrl?: string;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({ 
  backgroundColor = '#1976d2',
  iconUrl = '/robot.svg'
}) => {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => prev >= 3 ? 1 : prev + 1);
    }, 700); // 500msごとにドットの数を変更

    return () => clearInterval(interval);
  }, []);

  const dots = '・'.repeat(dotCount);

  return (
    <CompanyMessage 
      message={dots}
      backgroundColor={backgroundColor}
      iconUrl={iconUrl}
    />
  );
};
