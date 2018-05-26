var item = '<ul class="nav nav-list"> \
  <li class="nav-header">Brusque Extension</li><li class=""> \
    <a href="' + chrome.extension.getURL('/options.html') + '" data-non-pjax="1">Options</a> \
  </li> \
</ul>';
$('.backplate').append(item);