const button = document.querySelector('body > button');
const slogans = document.querySelectorAll('body > div.slogan');
const rayContainer = document.querySelector('body > div#ray-container');

/* RAY LIFECYCLE:
    - (1/3) initial/default state outside the viewport
    - (2/3) hovered state: rays slide into the viewport
    - hovered rays can either return to initial state (1), or progress to their final state (3)
    - (3) clicked state: final state outside the viewport, so that rays swipe out perpendicular to their axis
    - after reaching their final state, rays are disposed
*/

const getActiveRays = () => document.querySelectorAll('body > div#ray-container > .ray:not(.mode-clicked)');


button.addEventListener('click', async () => {

    // create rays, if needed
    if (!getActiveRays().length) {
        rayContainer.insertAdjacentHTML('beforeend', `
            <div class="ray ray-A mode-hovered"></div>
            <div class="ray ray-B mode-hovered"></div>
        `)
    }
    forceGlobalBrowserReflow();

    // swipe-out rays into their final state and dispose
    getActiveRays().forEach(ray => {
        ray.classList.remove('mode-hovered');
        ray.classList.add('mode-clicked');
        ray.addEventListener('transitionend', () => { ray.parentNode.removeChild(ray); }, { once: true });
    })

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
                    // actually copy to clipboard xD
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


button.addEventListener('mouseenter', () => {
    // hide slogans
    slogans.forEach(slogan => slogan.classList.add('hidden'));

    // create rays, if needed
    if (!getActiveRays().length) {
        rayContainer.insertAdjacentHTML('beforeend', `
            <div class="ray ray-A"></div>
            <div class="ray ray-B"></div>
        `)
    }
    forceGlobalBrowserReflow();

    // slide-in rays
    getActiveRays().forEach(ray => ray.classList.add('mode-hovered'));
});
button.addEventListener('mouseleave', () => {
    // reset button icon
    button.className = "";

    // fade-in slogans
    slogans.forEach(slogan => slogan.classList.remove('hidden'));

    // slide-out rays, if possible/needed
    if (getActiveRays().length) {
        getActiveRays().forEach(ray => ray.classList.remove('mode-hovered'));
    }
});


async function getCurrentTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0]);
        });
    });
}

function forceGlobalBrowserReflow() {
    // it does not matter which element's computedStyle is requested, reflow is global in any case
    const _someElement = document.documentElement;

    // it does not matter which property is accessed (but some property from the `CSSStyleDeclaration` object has to be accessed)
    const _someProperty = 'width';

    window.getComputedStyle(_someElement).getPropertyValue(_someProperty);
}
