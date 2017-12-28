console.log('views/notifications.js');


/**
* Display a simple text desktop notification
*/
window.TextNotificationView = Backbone.View.extend({


  initialize: function(options, url) {
    _.bindAll(this);
    if (url) {
      this.url = url;
    } else if (options) {
      this.url = null;
    }
    this.options = options;
  },


  /**
   * Trigger the actual display of a notification
   */
  render: function() {
    console.log('notification.render');
    if (this.options && this.options.title) {
      var notification = this.options;
    } else {
      var notification = this.selectDetails();
    }
    if (!notification) {
      return false;
    }
    console.log('notification shown');
    chrome.notifications.create(this.url, notification);
    return this;
  },


  /**
   * If autoDismiss is enabled setTimeout to close notifications
   */
  // setTimeout: function() {
  //   var that = this;
  //   if (!config.get('autoDismiss') || !that.notification) {
  //     return that;
  //   }
  //   setTimeout(function(){
  //     // that.notification.close();
  //   }, config.get('autoDismissDelay') * 1000);
  // },


  /**
   * Select the title, body, image, url based on the action type
   */
  selectDetails: function() {
    // TODO: refactor this
    console.log('notification.selectDetails');

    var action = this.model.get('action');
    var notification = {type:'basic'};

    if (!action && this.model.get('id')) {
      // mention
      if (!config.get('actionsMention')) {
        return false;
      }
      var user = this.model.get('user');
      var object = this.model.toJSON();
      config.set('mentions_since_id', object.id);
      if (typeof object.content === 'undefined') {
        return false;
      }
      notification.message = object.content.text;
      if (object.reply_to) {
        notification.title = 'Reply from @' + user.username;
      } else {
        notification.title = 'Mention from @' + user.username;
      }
      this.url = 'https://posts.pnut.io/' + object.id;
      if (object.raw && object.raw.length > 0) {
        for (index in object.raw) {
          if (object.raw[index].type == 'io.pnut.core.crosspost') {
            this.url = object.raw[index].value.canonical_url;
          }
        }
      }
    } else {
      // action
      var user = this.model.get('users')[0];
      var object = this.model.get('objects')[0];
      config.set('interactions_since_id', object.pagination_id);
      if ('follow' === action) {
        if (!config.get('actionsFollow')) {
          return false;
        }
        if (user.you_follow) {
          notification.title = 'Followed back by @' + user.username;
        } else {
          notification.title = 'Followed by @' + user.username;
        }
        notification.message = user && user.content && user && user.content.text || '';
        this.url = 'https://pnut.io/@' + user.username

      } else {
        this.url = 'https://posts.pnut.io/' + object.id;
        if (object.raw && object.raw.length > 0) {
          for (index in object.raw) {
            if (object.raw[index].type == 'io.pnut.core.crosspost') {
              this.url = object.raw[index].value.canonical_url;
            }
          }
        }

        if ('bookmark' === action) {
          if (!config.get('actionsStar')) {
            return false;
          }
          notification.message = object.content.text;
          notification.title = 'Bookmark by @' + user.username;

        } else if ('repost' === action) {
          if (!config.get('actionsRepost')) {
            return false;
          }
          notification.title = 'Repost by @' + user.username;
          notification.message = object.content.text;

        } else {
          notification.title = action + ' by @' + user.username;
          notification.message = object.content.text;
        }
      }
    }

    notification.iconUrl = user.content.avatar_image.link + '?w=200';
    return notification;
  },

});
