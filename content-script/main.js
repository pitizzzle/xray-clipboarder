// listen for messages from the popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.operation === 'GET_USER_SELECTION') {
        const userSelection = window.getSelection().toString();
        if (userSelection) {
            sendResponse(userSelection);
        }
    }
});
