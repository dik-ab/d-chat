(function() {
  // 既に読み込まれている場合は何もしない
  if (window.DChatWidget) {
    return;
  }

  // ウィジェットクラス
  class DChatWidget {
    constructor(options = {}) {
      this.options = {
        chatUrl: options.chatUrl || 'http://localhost:3000',
        widgetUrl: options.widgetUrl || 'http://localhost:3000/widget',
        position: options.position || 'bottom-right',
        ...options
      };
      
      this.isVisible = true;
      this.isModalOpen = false;
      
      this.init();
    }

    init() {
      this.createWidget();
      this.attachEvents();
    }

    createWidget() {
      // ウィジェットコンテナ
      this.widgetContainer = document.createElement('div');
      this.widgetContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        width: 170px;
        height: 170px;
      `;
      this.widgetContainer.style.display = this.isVisible ? 'block' : 'none';

      // ウィジェット用iframe
      this.widgetIframe = document.createElement('iframe');
      this.widgetIframe.src = this.options.widgetUrl;
      this.widgetIframe.scrolling = 'no';
      this.widgetIframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        overflow: hidden;
      `;

      this.widgetContainer.appendChild(this.widgetIframe);
      document.body.appendChild(this.widgetContainer);
    }

    attachEvents() {
      // メッセージリスナー
      window.addEventListener('message', (event) => {
        if (event.origin !== new URL(this.options.chatUrl).origin) {
          return;
        }

        switch (event.data.type) {
          case 'CLOSE_WIDGET':
            this.hide();
            break;
          case 'OPEN_CHAT':
            this.openModal();
            break;
          case 'CLOSE_CHAT':
            this.closeModal();
            break;
        }
      });
    }

    openModal() {
      if (this.isModalOpen) return;
      
      this.isModalOpen = true;
      
      // アイコンを非表示
      this.widgetContainer.style.display = 'none';
      
      // チャットウィンドウを右下に固定表示
      this.chatWindow = document.createElement('div');
      this.chatWindow.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 374px;
        height: 704px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        overflow: hidden;
      `;

      const chatIframe = document.createElement('iframe');
      chatIframe.src = this.options.chatUrl;
      chatIframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;

      this.chatWindow.appendChild(chatIframe);

      document.body.appendChild(this.chatWindow);
    }

    closeModal() {
      if (!this.isModalOpen) return;
      
      this.isModalOpen = false;
      if (this.chatWindow) {
        document.body.removeChild(this.chatWindow);
        this.chatWindow = null;
      }
      
      // アイコンを再表示
      if (this.isVisible) {
        this.widgetContainer.style.display = 'block';
      }
    }

    show() {
      this.isVisible = true;
      this.widgetContainer.style.display = 'block';
    }

    hide() {
      this.isVisible = false;
      this.widgetContainer.style.display = 'none';
    }

    destroy() {
      if (this.widgetContainer) {
        document.body.removeChild(this.widgetContainer);
      }
      if (this.chatWindow) {
        document.body.removeChild(this.chatWindow);
      }
    }
  }

  // グローバルに公開
  window.DChatWidget = DChatWidget;

  // 自動初期化（オプション）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!window.dChatWidgetInstance) {
        window.dChatWidgetInstance = new DChatWidget();
      }
    });
  } else {
    if (!window.dChatWidgetInstance) {
      window.dChatWidgetInstance = new DChatWidget();
    }
  }
})();
