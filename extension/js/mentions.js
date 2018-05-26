console.log('mentions.js');

/**
 * A single Mention
 */
window.Mention = Backbone.Model.extend({


  initialize: function() {
    _.bindAll(this);
    this.view = new TextNotificationView({ model: this });
  },


  url: 'https://api.pnut.io/v0/users/me/mentions',


  // validate: function(attributes) {
  //   if (attributes.text.length > 256) {
  //     return 'text is too long';
  //   }
  // },
  // 
  // 
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


  // success: function(response, textStatus, jqXHR) {
  //   var notification = new TextNotificationView({
  //     title: 'Successfully posted to pnut.io',
  //     body: response.text,
  //     image: response.user.avatar_image.link,
  //     url: 'https://pnut.io/@' + response.user.username + '/post/' + response.id,
  //     timeout: 5 * 1000,
  //     type: 'PostSuccess'
  //   });
  //   notification.render();
  // },
  // 
  // 
  // error: function() {
  //   var notification = new TextNotificationView({
  //     image: chrome.extension.getURL('/img/br.png'),
  //     title: 'Posting to pnut.io failed',
  //     body: 'Please try again.',
  //     timeout: 10 * 1000,
  //     type: 'PostError'
  //   });
  //   notification.render();
  // }


});


/**
 * This is left over from a previous design choice. It may be going away.
 */
var Polling = Backbone.Collection.extend({


  initialize: function(options) {
    _.bindAll(this, 'error');
    // _.extend(this, options);
  },


});


/**
 * A collection of Mentions
 */
var Mentions = Polling.extend({


  model: Mention,


  url: 'https://api.pnut.io/v0/users/me/mentions',


  initialize: function() {
    _.bindAll(this, 'checkForNew');
  },


  checkForNew: function(options) {
    if (accounts.length === 0 || !navigator.onLine) {
      return false;
    }
    // TODO: this.error is undefined
    var params = {
      error: this.error,
      update: true,
      data: {
        include_post_raw: 1,
        include_deleted: 0,
        since_id: config.get('mentions_since_id') || 'last_read'
      },
      headers: {
        'Authorization': 'Bearer ' + accounts.at(0).get('access_token')
      }
    };
    if (typeof options !== 'undefined') {
      params.data.count = 1;
    } else {
      params.data.count = 20;
    }
    _.extend(params, options);
    console.log('mentions.checkForNew', params);
    this.fetch(params);
  },


  parse: function(response) {
    if (typeof response.meta.max_id !== 'undefined') {
      config.set('mentions_since_id', response.meta.max_id);
    }
    return response.data;
  },


  renderNotification: function(model, collection, options) {
    console.log('mentions.renderNotification');
    model.view.render();
  },


});


window.mentions = new Mentions();
