console.log('brusque:content_twitter.js');

$('input.submit').before('<input class="button selected submit brusque-submit" value="Post to pnut.io">');
$('.brusque-submit').click(function() {
  var message = {
    method: 'post',
    action: 'posts',
    data: { text: $('#status').val() }
  };
  chrome.runtime.sendMessage(message, function(response) { });
});
