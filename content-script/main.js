
// listen for messages from the popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.operation === 'GET_USER_SELECTION') {
        const userSelection = getUserSelection();
        console.log({ userSelection }); // XXX
        sendResponse(userSelection);
    }
});


// search for user selection recursively
function getUserSelection(frame = window) {
    let userSelection = frame.getSelection().toString();
    if (userSelection) {
        return userSelection;
    }

    // fallback no 1: recursive child frames
    for (let i = 0; i < frame.length; i++) {
        const subFrame = frame[i];
        userSelection = getUserSelection(subFrame);
        if (userSelection) {
            return userSelection;
        }
    }

    // fallback no 2
    return "";
}
