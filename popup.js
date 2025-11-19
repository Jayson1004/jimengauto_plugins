// 即梦批量上传插件 - 弹窗脚本

document.addEventListener('DOMContentLoaded', function() {
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('status-text');
  const openPanelBtn = document.getElementById('open-panel');
  const refreshPageBtn = document.getElementById('refresh-page');
  const helpBtn = document.getElementById('help');
  const feedbackLink = document.getElementById('feedback');
  const imageGenTriggerBtn = document.getElementById('image-gen-trigger');
  const videoGenTriggerBtn = document.getElementById('video-gen-trigger');

  // 检查当前页面状态
  checkPageStatus();

  // 绑定事件
  openPanelBtn.addEventListener('click', openControlPanel);
  refreshPageBtn.addEventListener('click', refreshCurrentPage);
  helpBtn.addEventListener('click', showHelp);
  feedbackLink.addEventListener('click', showFeedback);
  
  imageGenTriggerBtn.addEventListener('click', () => sendActionToContentScript('imageGen'));
  videoGenTriggerBtn.addEventListener('click', () => sendActionToContentScript('videoGen'));

  // Function to send action to content script
  function sendActionToContentScript(actionType) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: actionType }, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error sending message to content script:", chrome.runtime.lastError);
            // If content script hasn't loaded, inject it
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['content.js']
            }, () => {
              chrome.scripting.insertCSS({
                target: { tabId: tabs[0].id },
                files: ['styles.css']
              });
              // Try sending the message again after injection
              chrome.tabs.sendMessage(tabs[0].id, { action: actionType });
            });
          }
        });
      }
      window.close(); // Close popup after triggering action
    });
  }

  // 检查页面状态
  function checkPageStatus() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];
      
      if (currentTab.url && (currentTab.url.includes('jimeng.ai') || currentTab.url.includes('jianyingai.com') || currentTab.url.includes('jianying.com'))) {
        statusDiv.className = 'status active';
        statusText.textContent = '✓ 即梦页面已检测到';
        openPanelBtn.disabled = false;
      } else {
        statusDiv.className = 'status inactive';
        statusText.textContent = '✗ 请打开即梦官网';
        openPanelBtn.disabled = true;
      }
    });
  }

  // 打开控制面板
  function openControlPanel() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'showPanel'
      }, function(response) {
        if (chrome.runtime.lastError) {
          // 如果content script还没加载，尝试注入
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
          }, function() {
            // 注入CSS
            chrome.scripting.insertCSS({
              target: { tabId: tabs[0].id },
              files: ['styles.css']
            });
          });
        }
        window.close();
      });
    });
  }

  // 刷新当前页面
  function refreshCurrentPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.reload(tabs[0].id);
      window.close();
    });
  }

  // 显示帮助信息
  function showHelp() {
    const helpContent = `
即梦批量上传助手使用说明：

1. 打开即梦官网 (jimeng.ai)
2. 点击"打开控制面板"按钮
3. 添加分镜：
   - 单个添加：点击"添加分镜"
   - 批量导入：点击"批量导入"选择图片
4. 为每个分镜设置提示词
5. 调整提交间隔时间（4-15秒）
6. 点击"开始上传"自动批量提交

功能特点：
- 支持拖拽调整分镜顺序
- 自动清理上一个分镜内容
- 实时显示上传进度
- 支持暂停/继续操作

注意事项：
- 请确保网络连接稳定
- 建议设置合适的提交间隔
- 上传过程中请勿手动操作即梦页面
    `;
    
    alert(helpContent);
  }

  // 显示反馈信息
  function showFeedback(e) {
    e.preventDefault();
    alert('如有问题或建议，请联系开发者\n\n感谢您的使用！');
  }

  // 监听来自content script的消息
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateStatus') {
      // 更新状态显示
      checkPageStatus();
    }
  });
});
