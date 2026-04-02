// EZE3 | Background Tab Management
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'close_tab' && sender.tab) {
        chrome.tabs.remove(sender.tab.id);
    }
});
