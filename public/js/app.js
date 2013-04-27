if (document.getElementById('countdown')) (function () {

function strpad(s,w,c){
  w=w||2;
  w-=(s=""+s).length;
  return (0<w?Array(w+1).join(c||0):"") + s;
}

var target = (+new Date()) + (10 * 1000 * 60),
    countdown = document.getElementById('countdown'),
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
    countdown.submit();
  }
}, 1000);

})();

$(".chosen").chosen();
