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
    if (attributes.text.length > 256) {
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
      title: 'Successfully posted to pnut.io',
      body: model.get('text'),
      image: model.get('user').content.avatar_image.link,
      url: 'https://pnut.io/@' + model.get('user').username,
      timeout: 5 * 1000,
      type: 'PostSuccess'
    });
    notification.render();
  },


  error: function(msg) {
    var notification = new TextNotificationView({
      image: chrome.extension.getURL('/img/br.png'),
      title: msg || 'Posting to pnut.io failed',
      body: 'Please try agian. This notification will automatically go poof.',
      timeout: 10 * 1000,
      type: 'PostError'
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
        include_post_annotations: 1
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
        image: chrome.extension.getURL('/img/br.png'),
        title: 'Authentication failed',
        body: 'Click here to sign in to pnut.io again.',
        url: chrome.extension.getURL('/options.html'),
        type: 'AuthError'
      });
      notification.render();
      // TODO: update this to support multiple accounts
      accounts.remove(accounts.at(0));
    } else {
      console.log('Unkown error');
      var notification = new TextNotificationView({
        image: chrome.extension.getURL('/img/br.png'),
        title: 'Unkown error checking for posts',
        body: 'If you get this a lot please ping @abraham',
        url: 'https://alpha.app.net/abraham',
        type: 'UnknownError'
      });
      notification.render();
    }
    return this;
  }


});
