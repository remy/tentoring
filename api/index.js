var express = require('express');
var indexjs = require('indexjs');

var routers = indexjs(__dirname, []);

var api = express.Router();

routers.forEach(function (router) {
  api.use(router.path, router); 
});

module.exports = api;


