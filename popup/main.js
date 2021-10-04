const button = document.querySelector('button');

button.addEventListener('click', async () => {
    chrome.tabs.sendMessage(
        (await getCurrentTab()).id,
        { operation: "GET_USER_SELECTION" },
        { frameId: 0 }, // the top-level frame
        async (userSelection) => {
            try {
                if (userSelection) {
                    await navigator.clipboard.writeText(userSelection);
                    button.className = 'check';
                }
                else {
                    button.className = 'cross';
                }
            }
            catch (err) {
                console.error('❌', err);
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
