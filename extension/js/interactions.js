console.log('interactions.js');

/**
 * A single interaction
 */
window.Interaction = Backbone.Model.extend({
  
  
  // HACK: Actions from the API don't have an id. This will not work if there are more than one interaction in any givin second
  idAttribute: 'event_date',

  initialize: function() {
    _.bindAll(this);
    this.view = new TextNotificationView({ model: this });
  },


  url: 'https://api.pnut.io/v0/users/me/actions',


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
  //     body: 'Please try agian. This notification will close in 10 seconds.',
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
 * A collection of interactions
 */
var Interactions = Polling.extend({


  model: Interaction,


  url: 'https://api.pnut.io/v0/users/me/actions',



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
        since_id: config.get('interactions_since_id') || 'last_read',
        exclude: 'reply'
      },
      headers: {
        'Authorization': 'Bearer ' + accounts.at(0).get('access_token')
      }
    };
    if (!config.get('actionsFollow')) {
      params.data.exclude += ',follow';
    }
    if (!config.get('actionsStar')) {
      params.data.exclude += ',bookmark';
    }
    if (!config.get('actionsRepost')) {
      params.data.exclude += ',repost';
    }
    if (typeof options !== 'undefined') {
      params.data.count = 1;
    } else {
      params.data.count =20;
    }
    _.extend(params, options);
    console.log('interactions.checkForNew', params);
    this.fetch(params);
  },


  parse: function(response) {
    if (typeof response.meta.max_id !== 'undefined') {
      config.set('interactions_since_id', response.meta.max_id);
    }
    return response.data;
  },


  renderNotification: function(model, collection, options) {
    console.log('interactions.renderNotification');
    model.view.render();
  },


});


window.interactions = new Interactions();
