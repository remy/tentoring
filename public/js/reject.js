;(function () {

  var xhr = new XMLHttpRequest();
  xhr.open('PUT', location.origin + '/api/questions/' + location.search.match(/id=([\d\w]+)/)[1] + '?reject=true');
  xhr.addEventListener('loaded', function () {
    console.log(arguments);
    console.log('it done it');
  });
  xhr.send();

}());
