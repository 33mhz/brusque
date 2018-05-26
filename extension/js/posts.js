console.log('posts');

/**
 * A single post
 */
window.Post = Backbone.Model.extend({


  initialize: function() {
    _.bindAll(this);
  },


  url: 'https://api.pnut.io/v0/posts',


  /**
   * Basic validations of a post
   */
  validate: function(attributes) {
    var text = attributes.text.replace(/\[(.+)\]\(((?:https?:\/\/)?([^/?#]+)[^\)]*)\)/g,"$1 [$3]");
    if (text.length > 256) {
      return 'text is too long';
    }
  },


  // save: function() {
  //   if (this.get('text') && this.get('text').length < 256) {
  //     // TODO: for some reason this is not adding the response to the model
  //     var jqXHR = $.post(this.url, this.attributes)
  //         .success(this.success)
  //         .error(this.error);
  //   } else {
  //     return false;
  //   }
  // },


  /**
   * Pull the post data out of the reponse object
   */
  parse: function(response) {
    return response.data;
  },


  success: function(model, textStatus, jqXHR) {
    var notification = new TextNotificationView({
      title: 'Successfully posted to Pnut',
      message: model.get('text').replace(/\[(.+)\]\(((?:https?:\/\/)?([^/?#]+)[^\)]*)\)/g,"$1 [$3]"),
      iconUrl: model.get('user').content.avatar_image.link + '?w=200',
      type: 'basic'
    }, 'https://pnut.io/@' + model.get('user').username);
    notification.render();
  },


  error: function(msg) {
    var notification = new TextNotificationView({
      iconUrl: chrome.extension.getURL('/img/br-128.png'),
      title: msg || 'Posting to Pnut failed',
      message: 'Please try agian. This notification will automatically go poof.',
      type: 'basic'
    });
    notification.render();
  }


});


/**
 * Generic collection for handling posts
 */
var Posts = Backbone.Collection.extend({


  initialize: function(options) {
    _.bindAll(this);
    _.extend(this, options);
  },


  url: 'https://api.pnut.io/v0/posts',


  /**
   * Pull the data out of the response object
   */
  parse: function(response) {
    return response.data;
  },


  /**
   * Poll API for updates
   */
  requestUpdates: function() {
    // If there is not any authenticated users or network request, exit
    if (accounts.length === 0 || !navigator.onLine) {
      return false;
    }
    this.fetch({
      error: this.error,
      update: true,
      data: {
        count: 20, // TODO: start using since_id
        include_post_raw: 1
      },
      headers: {
        'Authorization': 'Bearer ' + accounts.at(0).get('access_token')
      }
    });
  },


  error: function(collection, response, options) {
    // TODO: update copy of notifications
    if (response.status === 401) {
      console.log('Invalid access_token');
      var notification = new TextNotificationView({
        iconUrl: chrome.extension.getURL('/img/br-128.png'),
        title: 'Authentication failed',
        message: 'Click here to sign in to Pnut again.',
        type: 'basic'
      }, chrome.extension.getURL('/options.html'));
      notification.render();
      // TODO: update this to support multiple accounts
      accounts.remove(accounts.at(0));
    } else {
      console.log('Unkown error');
      var notification = new TextNotificationView({
        iconUrl: chrome.extension.getURL('/img/br-128.png'),
        title: 'Unkown error checking for posts',
        message: 'If you get this a lot please ping @33MHz',
        type: 'basic'
      }, 'https://pnut.io/@33MHz');
      notification.render();
    }
    return this;
  }


});
