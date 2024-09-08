const MainLoopInterval = 200; // ms

const AdInProgressSelectors = [
    '.ytp-skip-ad-button',
    '.ytp-preview-ad',
]

const SkipAdBtnSelectors = [
    '.ytp-skip-ad-button',
]

const MuteBtnSelectors = [
    '.ytp-mute-button',
]

const VolumeSliderSelector = ".ytp-volume-slider-handle";

class Events {
    constructor() {
        this.events = {};
    }

    addEvent(event, callback) {

        if (Array.isArray(this.events[event])) {
            this.events[event].push(callback);
        } else {
            this.events[event] = [callback];
        }
        
    }

    invokeEvent(event, ...args) {
        console.log('Event invoked:', event);
        if (Array.isArray(this.events[event])) {
            for (let callback of this.events[event]) {
                
                callback(...args);
            }
        } else {
            this.events[event](...args);
        }
    }
}

class AdHandler {
    adInProgress = false;
    skipBtnDetected = false;

    AdSkipperInstance;
    AdMuterInstance;

    constructor() {
        this.AdSkipperInstance = new AdSkipper();
        this.AdMuterInstance = new AdMuter();

        this.AdSkipperInstance.SetupListeners();
        this.AdMuterInstance.SetupListeners();
    }

    IsAdPlaying() {
        for (let selector of AdInProgressSelectors) {
            if (document.querySelector(selector)) {
                return true;
            }
        }

        return false;
    }

    CheckForAd() {
        let adPlaying = this.IsAdPlaying();
        if (adPlaying) {
            this.adInProgress = true;
            EventsHandler.invokeEvent(AllEvents.AdPlayStarted);
        }
    }

    CheckForSkipBtn() {
        for (let selector of SkipAdBtnSelectors) {
            if (document.querySelector(selector)) {
                this.skipBtnDetected = true;
                EventsHandler.invokeEvent(AllEvents.SkipBtnDetected);
                break;
            }
        }
    }

    AdEnded() {
        this.adInProgress = false;
        this.skipBtnDetected = false;
        EventsHandler.invokeEvent(AllEvents.AdEnded);
    }

}

class AdSkipper {

    constructor() {
    
    }

    SetupListeners() {
        EventsHandler.addEvent(AllEvents.SkipBtnDetected, () => this.HandleSkipBtnDetected);
    }

    HandleSkipBtnDetected() {
        console.log('Skip button detected - AdSkipper');
        this.SkipAd();
    }

    SkipAd() {
        console.log('Ad skipped');
        for (let selector of SkipAdBtnSelectors) {
            var skipBtn = document.querySelector(selector);
            if (skipBtn != null) {
                skipBtn.click();
            }
        }
    }

    
}

class AdMuter {
    constructor() {
    
    }

    SetupListeners() {
        EventsHandler.addEvent(AllEvents.AdPlayStarted, () => this.HandleAdStarted());
        EventsHandler.addEvent(AllEvents.AdEnded, () => this.HandleAdEnded());
    }

    HandleAdStarted() {
        console.log('Ad started - AdMuter');
        this.MuteVideo();
    }

    HandleAdEnded() {
        console.log('Ad ended - AdMuter');
        this.UnmuteVideo();
    }

    IsVideoMuted() {
        const volumeSlider = document.querySelector(VolumeSliderSelector);
        if (volumeSlider === null) return false;

        if (volumeSlider.style.left === '0%') return true;
        if (volumeSlider.style.left === '0px') return true;
        if (volumeSlider.style.left === '0') return true;

        return false;
    }

    MuteVideo() {
        console.log('Video muted');

        let isMuted = this.IsVideoMuted();
        if (isMuted) return;

        this.ClickMuteBtn();
    }

    UnmuteVideo() {
        console.log('Video unmuted');

        let isMuted = this.IsVideoMuted();
        if (!isMuted) return;

        this.ClickMuteBtn();
    }

    ClickMuteBtn() {
        for (let selector of MuteBtnSelectors) {
            var muteBtn = document.querySelector(selector);
            if (muteBtn != null) {
                muteBtn.click();
            }
        }
    }
}

const AllEvents = {
    ["AdPlayStarted"]: "adPlayStarted",
    ["SkipBtnDetected"]: "skipBtnDetected",
    ["AdEnded"]: "adEnded",
}

const EventsHandler = new Events();
const AdHandlerInstance = new AdHandler();


function MainLoop() {

    // Check for ad
    if (!AdHandlerInstance.adInProgress) {
        AdHandlerInstance.CheckForAd();

    // If ad is in progress, check for skip button
    } else if (AdHandlerInstance.adInProgress && !AdHandlerInstance.skipBtnDetected) {
        AdHandlerInstance.CheckForSkipBtn();

    } else if (AdHandlerInstance.adInProgress) {
        let adStillPlaying = AdHandlerInstance.IsAdPlaying();
        if (!adStillPlaying) {
            AdHandlerInstance.AdEnded();
        }
    }
}

setInterval(MainLoop, MainLoopInterval);
