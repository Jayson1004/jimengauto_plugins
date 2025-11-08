// 即梦批量上传插件 - 后台脚本

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener(() => {
    console.log('即梦批量上传助手已安装');
});

// 处理来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'uploadStatus') {
        // 可以在这里处理上传状态更新
        console.log('上传状态更新:', request.data);
    }

    if (request.action === 'getSettings') {
        // 获取用户设置
        chrome.storage.sync.get(['uploadInterval', 'autoStart'], (result) => {
            sendResponse(result);
        });
        return true; // 保持消息通道开放
    }

    if (request.action === 'saveSettings') {
        // 保存用户设置
        chrome.storage.sync.set(request.data, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

// 监听标签页更新，确保在即梦页面上激活插件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && (tab.url.includes('jimeng.ai') || tab.url.includes('jianyingai.com') || tab.url.includes('jianying.com'))) {
        // 可以在这里执行一些初始化操作
        console.log('即梦页面已加载，插件准备就绪');
    }
});