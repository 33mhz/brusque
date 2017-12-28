var item = '<ul class="nav nav-list"> \
  <li class="nav-header">Brusque Extension</li><li class=""> \
    <a href="' + chrome.extension.getURL('/options.html') + '" data-non-pjax="1">Options</a> \
  </li> \
</ul>';
$('.yui3-u-1-4.m-yui3-u-1').append(item);