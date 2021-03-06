console.log('brusque:content_script.js');

var observer = new MutationSummary({
  callback: handlePostMutations,
  queries: [
    { element: 'div.post-container' }
  ]
});

$('.post-container').each(function(index, post) { addShareLink(post); });
function handlePostMutations(summaries) {
  summaries[0].added.forEach(addShareLink);
}

function addShareLink(post) {
  var $post = $(post);
  $post.find('.post-details ul').append('<li class="show-on-hover"><a href="#" data-reply-to="" data-share=""><i class="icon-retweet"></i> Share</a></li>');
  $post.on('click', '[data-share]', handleClick);
}

function handleClick(event) {
  event.preventdefault;
  var $post = $(this).closest('.post-container');
  var text = 'Shared @' + $post.data('post-author-username') + ': ' + $post.find('[itemscope itemtype="https://pnut.io/schemas/Post"]').text() + ' ';
  $('[name="post"]').data('brusque-text', text);
  // Delay execution until after pnut.io adds text to the post textarea
  window.setTimeout(function() {
    $('[name="post"]').val($('[name="post"]').data('brusque-text'));
  }, 0);
}
