console.log('hashtags');


/**
 * Generic collection for handling posts
 */
var Hashtags = Posts.extend({


  initialize: function(options) {
    _.bindAll(this, 'url');
    _.extend(this, options);
    app.on('interval', this.requestUpdates, this);
  },


  url: function() {
    return 'https://api.pnut.io/v0/posts/tag/' + this.hashtag;
  },


  _validate: function() {
    
  }


});


var HASHTAGS = Backbone.Collection.extend({


  model: Hashtags


});