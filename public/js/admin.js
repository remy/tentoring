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

    if (target.nodeName === 'A') {
      var id = target.id;
      var base = window.location.origin + '/api/orgs/' + id;
      get(base + '/questions/meta', function loaded (event) {
        var questions = JSON.parse(event.target.responseText);
        var str = '<li>Total questions: ' + questions.total + '</li>';
        str += '<li> Answered questions: ' + questions.answered + '</li>';
        str += '<li> Unanswered questions: ' + (questions.total - questions.answered) + '</li>';
        str += '<li> <ul>';
        str += questions.skills.reduce(function (html, skill) {
          var li = '<li>' + skill.name + '<ul>'
          li += '<li> Total: ' + skill.total + '</li>'
          li += '<li> Answered: ' + skill.answered + '</li>'
          li += '<li> Unanswered: ' + (skill.total - skill.answered) + '</li>';
          li += '</ul></li>';
          return html + li;
        }, '');
        str += '</ul></li>';
        ul.innerHTML = str;
      });
    }

  });

});
