'use strict';

var when = require('when');
var mongoose = require('mongoose'),
    db = mongoose.connection,
    mongourl = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/tentoring';
var Org = require('./db/org');
var Event = require('./db/event');


mongoose.connect(mongourl);

db.once('open', function () {
  create('hatchcamp', {
    title: 'Ten Minute Mentoring for Hatchcamp',
    css: 'html { background-image: url(\'/im/orgs/hatchcamp.jpg\') }',
    skills: [
      'Funding',
      'Legal',
      'Technology',
      'Design',
      'Marketing',
      'Product',
      // 'Social',
      'Government',
      'Introductions',
      'Strategy',
      'Media',

      'Social impact',
      'Social media',
      'Scaling a business',
      'Management',
      'Events',

      ]
  }).then(function () {
    db.close();
  });
});

function create(slug, config) {
  var defer = when.defer();

  new Event({
    slug: slug + '-1'
  }).save(function (err, doc) {
    new Org({
      slug: slug,
      config: config,
      events: [doc]
    }).save(function () {
      defer.resolve();
    });
  });

  return defer.promise;
}

function load() {
  var defer1 = when.defer();
  var defer2 = when.defer();

  new Event({
    slug: 'tentoring-default'
  }).save(function (err, doc) {
    new Org({
      slug: 'tentoring',
      config: {
        title: 'Tentoring',
        lead: 'Ten minute mentoring',
        skills: ['Funding', 'Legal', 'Technology', 'Design', 'Marketing', 'Product', 'Social', 'Government', 'Introductions', 'Strategy', 'Media']
      },
      events: [doc]
    }).save(function () {
      defer1.resolve();
    });

  });

  new Event({
    slug: 'gfncamden-1'
  }).save(function (err, doc) {
    new Org({
      slug: 'gfncamden',
      config: {
        title: 'Ten Minute Mentoring for GFN Camden',
        css: 'html { background-image: url(\'/im/orgs/gfncamden.jpg\') }',
        skills: ['Funding', 'Legal', 'Technology', 'Design', 'Marketing', 'Product', 'Social', 'Government', 'Introductions', 'Strategy', 'Media', 'Education', 'Social enterprise']
      },
      events: [doc]
    }).save(function () {
      defer2.resolve();
    });

  });

  return when.all([defer1.promise, defer2.promise]);
}