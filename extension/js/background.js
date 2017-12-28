console.log('background.js');


config.background = true;


/**
 * Create an app with the config and accounts
 */
app = new App({
  model: config,
  collection: accounts,
});
app.ready();
setTimeout(promptAuth, 15 * 1000);

/**
 * Wire events
 */
config.on('change:frequency', app.changeInterval, app);
app.on('interval', interactions.checkForNew, interactions);
app.on('interval', mentions.checkForNew, mentions);
interactions.on('add', interactions.renderNotification, interactions);
mentions.on('add', mentions.renderNotification, mentions);
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method == "post" && request.action == 'posts') {
    var post = new Post();
    var save = post.save({ text: request.data.text }, {
      headers: {
        'Authorization': 'Bearer ' + accounts.at(0).get('access_token')
      },
      success: post.success,
      error: post.error,
    });
    if (save == false) {
      post.error('Post length was too long.');
    }
  }
});


/**
 * redirect after login
 */
chrome.runtime.onMessage.addListener(function(request, sender) {
  chrome.tabs.update(sender.tab.id, {url: request.redirect});
});


/**
 * open options page on click
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({url: chrome.extension.getURL('/options.html')}, function (tabs) {
    if (tabs.length != 0) {
      // found, switch to it
      chrome.tabs.update(tabs[0].id, {active: true});
    } else {
      // otherwise, open new
      chrome.tabs.create({url: chrome.extension.getURL('/options.html'), active: true});
    }
  });
});


/**
 * notification links
 */
chrome.notifications.onClicked.addListener(function(notificationId) {
  chrome.tabs.query({url: notificationId}, function (tabs) {
    if (tabs.length != 0) {
      // found, switch to it
      chrome.tabs.update(tabs[0].id, {active: true});
    } else {
      // otherwise, open new
      chrome.tabs.create({url: notificationId, active: true});
    }
  });
});

/**
 * omnibox events
 */
chrome.omnibox.setDefaultSuggestion({ description: 'Post to pnut.io' });
chrome.omnibox.onInputEntered.addListener(window.omniboxview.onInputEntered);
chrome.omnibox.onInputChanged.addListener(window.omniboxview.onInputChanged);


/**
 * If there are no accounts, prompt for auth
 */
accounts.on('ready', function() {
  promptAuth();
});

function promptAuth() {
  if (accounts.length === 0) {
    var n = new TextNotificationView({
      title: 'Connect your pnut.io account',
      message: 'Click to connect your pnut.io account and get started with the awesomeness of Brusque pnut.',
      iconUrl: chrome.extension.getURL('/img/br-128.png'),
      type: 'basic'
    }, accounts.buildAuthUrl());
    n.render();
  }
}
