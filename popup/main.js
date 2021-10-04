const button = document.querySelector('button');

button.addEventListener('click', async () => {
    chrome.tabs.sendMessage(
        (await getCurrentTab()).id,
        { operation: "GET_USER_SELECTION" },
        {},
        async (userSelection) => {
            try {
                // read/handle runtime.lastError (important if no content-script responded, to prevent Extension-wide error report)
                const expectedErrors = [
                    "Could not establish connection. Receiving end does not exist.",
                    "The message port closed before a response was received.",
                ];
                if (chrome.runtime.lastError && !expectedErrors.includes(chrome.runtime.lastError.message)) {
                    // re-throw
                    throw chrome.runtime.lastError;
                }


                if (userSelection) {
                    await navigator.clipboard.writeText(userSelection).catch(err => { });
                    button.className = 'check';
                }
                else {
                    throw new Error('No valid user selection (.. has been reported by the content scripts)');
                }
            }
            catch (err) {
                console.log('❌', err);
                button.className = 'cross';
            }
        }
    );
});

button.addEventListener('mouseleave', () => {
    button.className = "";
});


async function getCurrentTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0]);
        });
    });
}
