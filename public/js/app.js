'use strict';
/*global $:true*/

function strpad(s,w,c){
  w=w||2;
  w-=(s=''+s).length;
  return (0<w? new Array(w+1).join(c||0):'') + s;
}

function countdown() {
  document.documentElement.onkeydown = function (event) {
    if (event.which === 27) {
      target = +new Date();
    }
  };

  var target = (+new Date()) + (10 * 1000 * 60),
      counter = document.getElementById('counter');

  var timer = setInterval(function () {
    var now = +new Date();

    var d = (target - now) / 1000 | 0;
    if (d >= 0) {
      var minutes = strpad(d / 60 | 0, 2);
      var seconds = strpad((d - minutes * 60).toString().substr(0, 2), 2);
      counter.innerHTML = minutes + ':' + seconds;
    } else {
      // redirect
      clearInterval(timer);

      counter.innerHTML = 'NONE!!!';
      document.body.className = 'timeout';
    }
  }, 1000);

}

var $form = $('form#countdown');
$form.on('submit', function (event) {
  event.preventDefault();
  $.ajax({
    url: '/api/questions/' + token,
    type: 'PUT',
    data: {
      reply: $form.find('textarea.reply').val()
    }
  });
});


if (document.getElementById('countdown')) {
  countdown();
}

$('.chosen').chosen();
