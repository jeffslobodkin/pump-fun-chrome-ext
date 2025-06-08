// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INJECT_CONTENT') {
    // Handle content injection
    console.log('Content injection requested');
    sendResponse({ status: 'success' });
  }
  return true;
});

// Initialize content script
console.log('Pump Fun content script loaded'); 