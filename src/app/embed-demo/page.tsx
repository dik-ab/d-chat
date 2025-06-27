'use client';

import React, { useState } from 'react';
import { ChatIcon } from '../../components/icon/chat';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme/theme';

export default function EmbedDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);

  const openChat = () => {
    setIsModalOpen(true);
  };

  const closeChat = () => {
    setIsModalOpen(false);
  };

  const hideChat = () => {
    setIsChatVisible(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ 
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            color: '#333',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            サンプル企業サイト
          </h1>
          <div style={{
            lineHeight: '1.6',
            color: '#666',
            marginBottom: '40px'
          }}>
            <p>こちらは埋め込みデモ用のサンプルサイトです。実際の企業サイトを想定しています。</p>
            <p>右下にチャットアイコンが表示されており、クリックするとチャットアプリケーションが開きます。</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
          </div>
        </div>

        {/* チャットウィジェット */}
        {isChatVisible && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            cursor: 'pointer'
          }} onClick={openChat}>
            <ChatIcon onClose={hideChat} />
          </div>
        )}

        {/* モーダル */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            zIndex: 2000,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} onClick={closeChat}>
            <div style={{
              position: 'relative',
              width: '90%',
              maxWidth: '800px',
              height: '80%',
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>
              <span style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                color: '#aaa',
                fontSize: '28px',
                fontWeight: 'bold',
                cursor: 'pointer',
                zIndex: 2001,
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} onClick={closeChat}>
                &times;
              </span>
              <iframe 
                src="./index.html"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
