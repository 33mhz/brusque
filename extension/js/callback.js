console.log('callback.js');


var initOnce = _.once(init);
var account = new Account();
config.on('ready', initOnce);
accounts.on('ready', initOnce);


function parseHashString(string) {
  var arr = string.split('&');
  var obj = {};
  for (index in arr) {
    var split = arr[index].split('=')
    obj[split[0]] = split[1]
  }
  return obj;
}


function parseAccessToken() {
  var hash = location.hash.split('#')[1]
  var params = parseHashString(hash)
  return params['access_token'];
}


function successCallback() {
  console.log('Account fetch succesful');
  accounts.add(account);
  setTimeout(function() {
    chrome.runtime.sendMessage({redirect: chrome.extension.getURL('/options.html')});
  }, 2500)
}


function errorCallback() {
  alert('Oops. Unable to get full account details. Please try again or say wut, wut to @33MHz.');
  var sending = browser.runtime.sendMessage({
    greeting: 'Oops. Unable to get full account details. Please try again or say wut, wut to @33MHz.'
  });
  sending.then(function(message) {
    console.log(`Message from the background script:  ${message.response}`);
  }, function(error) {
    console.log(`Error: ${error}`);
  }); 
}

function init() {
  if (!accounts.ready && !config.ready) {
    return;
  }
  var accessToken = parseAccessToken();
  if (!accessToken) {
    alert('Oops. Unable to get access token. Please try again or say wut, wut to @33MHz.');
  } else {
    console.log('access_token set and fetching account');
    account.set('access_token', accessToken);
    account.fetch({
      success: successCallback,
      error: errorCallback,
      headers: {'Authorization': 'Bearer ' + account.get('access_token')}
    });
  }
}
