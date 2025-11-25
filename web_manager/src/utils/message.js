// 简单的消息提示工具（企业级项目通常使用Element Plus等UI库）
// 这里实现一个轻量级的消息提示

let messageContainer = null

function createMessageContainer() {
  if (messageContainer) return messageContainer
  
  messageContainer = document.createElement('div')
  messageContainer.className = 'message-container'
  messageContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    pointer-events: none;
  `
  document.body.appendChild(messageContainer)
  return messageContainer
}

function showMessage(text, type = 'info') {
  const container = createMessageContainer()
  const message = document.createElement('div')
  const id = `msg-${Date.now()}`
  
  const colors = {
    success: '#67c23a',
    error: '#f56c6c',
    warning: '#e6a23c',
    info: '#909399'
  }
  
  message.id = id
  message.style.cssText = `
    background: ${colors[type] || colors.info};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    margin-bottom: 10px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
    max-width: 400px;
    word-wrap: break-word;
  `
  message.textContent = text
  
  // 添加动画样式
  if (!document.getElementById('message-styles')) {
    const style = document.createElement('style')
    style.id = 'message-styles'
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }
  
  container.appendChild(message)
  
  // 3秒后自动移除
  setTimeout(() => {
    message.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message)
      }
    }, 300)
  }, 3000)
}

export const ElMessage = {
  success: (text) => showMessage(text, 'success'),
  error: (text) => showMessage(text, 'error'),
  warning: (text) => showMessage(text, 'warning'),
  info: (text) => showMessage(text, 'info')
}

