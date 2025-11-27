// localhost_content.js
// This script is injected into http://localhost:5173/* to listen for messages from the local webpage
// and forward them to the background script.

console.log('localhost_content.js loaded. Listening for messages from local page.');

window.addEventListener('message', (event) => {
    // We only accept messages from ourselves and with a specific type
    if (event.source !== window || !event.data || event.data.type !== 'JIMENG_UPLOADER_DATA') {
        return;
    }

    console.log('localhost_content.js received message from local page:', event.data.payload);

    // Forward the message to the background script
    chrome.runtime.sendMessage({
        action: 'processDataFromLocalPage',
        payload: event.data.payload
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message from localhost_content.js to background.js:', chrome.runtime.lastError.message);
        } else {
            console.log('Message sent to background.js. Response:', response);
            // Optionally, send a response back to the local page
            // event.source.postMessage({ type: 'PLUGIN_RESPONSE', status: response.status }, event.origin);
        }
    });
});
