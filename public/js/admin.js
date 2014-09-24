var get = function (url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('loadend', cb);
  xhr.open('GET', url);
  xhr.send();
};

get(window.location.origin + '/api/orgs', function (event) {
  var orgs = JSON.parse(event.target.responseText);
  var ul = document.createElement('ul');
  var content = orgs.map(function (org) {
    console.log(org);
    return '<li><a id="' + org._id  + '">' + org.config.title + '</a></li>'; 
  });
  ul.innerHTML = content.reduce(function (str, content) {
    str += content;
    return str;
  },'');

  document.querySelector('.main-body div').appendChild(ul);

  ul.addEventListener('click', function (event) {
    console.log(event);

    var target = event.target;

    function loaded () {
      var str = '<li>Total questions: ' + total + '</li>';
      str += '<li> Unanswered questions: ' + unanswered + '</li>';
      str += '<li> Answered questions: ' + (total - unanswered) + '</li>';
      ul.innerHTML = str;
    }

    if (target.nodeName === 'A') {
      var id = target.id;
      var base = window.location.origin + '/api/orgs/' + id;
      var count = 0;
      var total, unanswered;
      get(base + '/questions?count', function (event) {
        total = event.target.responseText * 1;
        if (++count === 2) {
          loaded();
        }
      });
      get(base + '/questions?count&answered=false', function (event) {
        console.log(event.target.responseText);
        unanswered = event.target.responseText * 1;
        if (++count === 2) {
          loaded();     
        } 
      });

    }

  });

});
