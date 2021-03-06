console.log('accounts.js');


/**
 * A single account the user has authorized
 */
window.Account = Backbone.Model.extend({


  url: 'https://api.pnut.io/v0/users/me',


  initialize: function() {
    // _.bindAll(this);
  },


  parse: function(response) {
    return response.data;
  }

});

/**
 * Collection of all accounts the user has authorized
 */
window.Accounts = Backbone.Collection.extend({


  /**
   * Convenience to know if chrome.storage values have been retrieved yet
   */
  ready: false,


  model: Account,


  initialize: function() {
    // Set up `this` to work in every method
    _.bindAll(this, 'getFromChrome', 'getFromChromeCallback', 'setChomeChangesToCollection');
    // Listen for changes to chrome.storage and propigate to model
    chrome.storage.onChanged.addListener(this.setChomeChangesToCollection);
    // Get current values from chrome.storage
    this.getFromChrome();
    // On change save new values to chrome.storage
    this.on('add', this.setCollectionChangesToChrome);
    this.on('remove', this.setCollectionChangesToChrome);
  },


  /**
   * Get accounts collection from chrome.storage.sync
   */
  getFromChrome: function() {
    chrome.storage.sync.get('accounts', this.getFromChromeCallback);
  },


  /**
   * Set changes of chrome.storage.sync to accounts collection
   */
  getFromChromeCallback: function(items){
    if (items['accounts']){
      this.reset(items['accounts']);
    }
    this.ready = true;
    this.trigger('ready');
    return this;
  },


  /**
   * Set changes of chrome.storage.sync to accounts collection
   */
  setChomeChangesToCollection: function(changes, ns) {
    // Ignore local changes
    if (ns != 'sync') {
      return this;
    }
    if (changes['accounts']) {
      this.reset(changes['accounts'].newValue);
    }
  },


  /**
   * Set changes of account collection to chrome.storage.sync
   *
   * Trigger at most once every five seconds
   */
   setCollectionChangesToChrome: _.debounce(function(model, collection, options) {
    chrome.storage.sync.set({'accounts': this.toJSON()});
  }, 2000),


  /**
   * Build the auth URL to authenticate account
   */
  buildAuthUrl: function() {
    var url = 'https://pnut.io/oauth/authenticate'
    url += '?client_id=' + config.get('clientId')
    url += '&response_type=token'
    url += '&redirect_uri=https://pnut.io/doesntexistbrusque/'
    url += '&scope=' + config.get('apiScope');
    return url;
  }


});


window.accounts = new Accounts();
