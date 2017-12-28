console.log('views/omnibox.js')


/**
 * Handle interactions with the Chrome omnibox
 */
window.OmniboxView = Backbone.View.extend({


  initialize: function() {
    _.bindAll(this);
  },
  // events: { },


  /**
   * Gets called when the user hits enter in the omnibox
   */
  onInputEntered: function(text) {
    if (text.indexOf('@@') === 0) {
      chrome.tabs.create({ url: 'https://pnut.io/@' + text.substring(2) });
      return;
    }
    
    if (text.indexOf('##') === 0) {
      chrome.tabs.create({ url: 'https://pnut.io/tags/' + text.substring(2) });
      return;
    }
    
    if (text.indexOf('::') === 0) {
      text = text.substring(2);
    }
    var post = new Post();
    // TODO: catch errors
    var save = post.save({ text: text }, {
      headers: {
        'Authorization': 'Bearer ' + accounts.at(0).get('access_token')
      },
      success: post.success,
      error: post.error,
    });
    if (save == false) {
      post.error('Post length was too long.');
    }
  },


  /**
   * Display suggestions to the user when the omnibox text changes
   */
  onInputChanged: function(text, suggest) {
    var suggestions = [];
    var text = text.replace(/\[(.+)\]\((?:.+)\)/g,"$1 [domain]");
    suggestions.push({ content: '::' + text, description: (256 - text.length) + ' characters remaning' });
    
    if (text.indexOf(' ') > -1 || text.length === 0) {
      suggest(suggestions);
      return;
    }
    if (text.indexOf('#') === 0 || text.indexOf('@') === 0) {
      text = text.substring(1);
    }
    
    suggestions.push({ content: '@@' + text, description: 'View the ' + text + " profile on pnut.io" });
    suggestions.push({ content: '##' + text, description: 'Search the ' + text + " tag on pnut.io" });
    suggest(suggestions);
  }
});


omniboxview = new OmniboxView();
