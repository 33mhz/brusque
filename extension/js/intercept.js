if (!window.location.hash) {
    document.body.textContent = "<p>Something went wrong! Contact @33MHz or submit a bug to <a href=\"https://github.com/33mhz/brusque/issues\">GitHub</a>.</p>";
} else {
    document.body.textContent = "<p>Redirecting to Brusque, for pnut.io...</p>";
    
    window.location = chrome.extension.getURL('/callback.html') + window.location.hash;
}