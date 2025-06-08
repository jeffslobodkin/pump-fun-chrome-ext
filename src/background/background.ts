chrome.runtime.onInstalled.addListener(() => {
  console.log('Pump Fun Extension installed');
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_WALLET_STATUS') {
    // Handle wallet status request
    sendResponse({ status: 'not_connected' });
  }
  
  if (message.type === 'CREATE_TOKEN') {
    // Handle token creation request
    console.log('Token creation requested:', message.data);
    sendResponse({ status: 'processing' });
  }
  
  return true; // Keep the message channel open for async responses
}); 