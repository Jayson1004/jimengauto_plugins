// WebSocket connection logic
const wsPort = 8000;
let socket = null;

function connectWebSocket() {
  // Disconnect if already connected
  console.log('WebSocket')
  if (socket && socket.readyState < 2) { // 0=CONNECTING, 1=OPEN
    console.log('[WebSocket] Already connected or connecting.');
    return;
  }

  socket = new WebSocket(`ws://localhost:8000/ws`);

  socket.onopen = function(e) {
    console.log(`[WebSocket] Connection established to ws://localhost:${wsPort}`);
  };

  socket.onmessage = function(event) {
    console.log(`[WebSocket] Data received from local server.`);
    try {
      const message = JSON.parse(event.data);
      // Assuming the message has the same structure as before: { action: 'update', payload: [...] }
      if (message.type === 'storyboard_update') {
        forwardDataToContentScript(message.payload); // Uncommented this line
      } else {
        console.warn('[WebSocket] Received message with unknown type:', message.type);
      }
    } catch (error) {
      console.error('[WebSocket] Error parsing received JSON data:', error);
    }
  };

  socket.onclose = function(event) {
    if (event.wasClean) {
      console.log(`[WebSocket] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      console.log('[WebSocket] Connection died. Attempting to reconnect in 6 seconds...');
      // Use alarms API for reconnection in service worker
      chrome.alarms.create('reconnect', { delayInMinutes: 0.1 });
    }
  };

  socket.onerror = function(error) {
    console.error(`[WebSocket] Connection Error: ${error.message}. Please ensure your local server is running.`);
    // onclose will be called next, which handles the reconnection logic.
  };
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'reconnect') {
    console.log('[WebSocket] Reconnecting due to alarm...');
    connectWebSocket();
  }
});

function forwardDataToContentScript(payload) {
  const sendMessageToTab = (tabId) => {
    // console.log(payload)
    chrome.tabs.sendMessage(tabId, { action: "processUpdate", payload: payload }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to jimeng content script:', chrome.runtime.lastError.message);
      }
    });
  };

  const targetUrls = [
    "*://jimeng.jianying.com/*",
    "*://*.jianyingai.com/*"
  ];

  chrome.tabs.query({ url: targetUrls }, (tabs) => {
    const jimengTab = tabs[0];
    
    if (jimengTab) {
      console.log(`Found existing jimeng tab (id: ${jimengTab.id}). Waiting 700ms before sending data...`);
      chrome.tabs.update(jimengTab.id, { active: true });
      setTimeout(() => {
        sendMessageToTab(jimengTab.id);
      }, 800); // Add a delay to ensure the content script is ready
    } else {
      console.log('No jimeng tab found. Creating a new one...');
      const defaultUrl = "https://jimeng.jianying.com/ai-tool/generate?type=image";
      chrome.tabs.create({ url: defaultUrl }, (newTab) => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === newTab.id && info.status === 'complete') {
            console.log(`New jimeng tab (id: ${newTab.id}) has loaded. Waiting 700ms before sending data...`);
            chrome.tabs.onUpdated.removeListener(listener);
            setTimeout(() => {
              sendMessageToTab(newTab.id);
            }, 800);
          }
        });
      });
    }
  });
}

// --- Extension Listeners ---

// Connect to WebSocket when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log('即梦批量上传助手已安装');
    connectWebSocket();
});

// Or, for a non-persistent background script (Manifest V3),
// you might want to ensure connection exists whenever you need it,
// or connect on startup.
chrome.runtime.onStartup.addListener(() => {
    console.log('Browser startup, connecting to WebSocket...');
    connectWebSocket();
});

// Attempt to connect immediately when the script is loaded/reloaded.
connectWebSocket();

// Listener for other actions from content scripts (e.g., settings)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'processDataFromLocalPage') {
        console.log('Background script received data from localhost_content.js:', request.payload);
        // Reuse the existing function to forward data to the jimeng tab
        forwardDataToContentScript(request.payload);
        sendResponse({ status: 'success', message: 'Data forwarded to jimeng tab.' });
        return; // Response sent synchronously, so we do not return true
    }
    if (request.action === 'getSettings') {
        chrome.storage.sync.get(['uploadInterval', 'autoStart'], (result) => {
            sendResponse(result);
        });
        return true; // async response
    }

    if (request.action === 'saveSettings') {
        chrome.storage.sync.set(request.data, () => {
            sendResponse({ success: true });
        });
        return true; // async response
    }
});
