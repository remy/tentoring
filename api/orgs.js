var express = require('express');

var Orgs = require('../models/Orgs');
var Questions = require('../models/Questions');
var Users = require('../models/Users');

var ObjectId = require('mongoose').Types.ObjectId;

var orgs = express.Router();
orgs.path = '/orgs';

module.exports = orgs;

var parseString = function (str) {
  return (/^[\d]+$/.test(str) && ~~str) || ((!/^[true|false]$/.test(str) && str) || !str[4]);
};

orgs.get('/', function (req, res) {
  Orgs.find(function (err, results) {
    if (err) {
      return res.send(err);
    }
    res.send(results);
  });
});

orgs.get('/:id', function (req, res) {
  Orgs.findOne({_id: req.params.id}, function (err, result) {
    if (err) {
      return res.send(err);
    }
    res.send(result);
  });
});

var allowedQueries = ['answered'];

orgs.get('/:id/questions', function (req, res) {
  var query = Questions.find({org: req.org});

  for (var val in req.query) {
    if (allowedQueries.indexOf(val) !== -1) {
      query = query.where(val).equals(parseString(req.query[val]));
    }
  }

  if (req.query.count !== undefined) {
    query = query.count();
  }

  query.exec(function (err, results) {
    if (err) {
      return res.send(err);
    }
    res.send(200, results);
  });
});

var parseQuestionMetadata = function (result) {
  var skills = result.map(function (item) {
    return {
      name: item._id.skill || item._id.tag || '[No Tag]',
      total: item.total,
      answered: item.answered
    };
  });
  var metadata = {
    total: skills.reduce(function (sum, skill) {
      return sum + skill.total;
    }, 0),
    answered: skills.reduce(function (sum, skill) {
      return sum + skill.answered;
    }, 0),
    skills: skills
  };
  return metadata;
};

orgs.get('/:id/questions/meta', function (req, res) {
  var query = Questions.aggregate([{
    $match: {
      org: ObjectId(req.params.id),
    }
  },
  {
    $group: {
      _id: {
        tag: '$tag',
        skill: '$skill'
      },
      total: {
        $sum: 1
      },
      answered: {
        $sum: {
          $cond: [
            '$answered',
            1,
            0
          ]
        }
      }
    }
  }],
  function(err, result) {
    if (err) {
      return res.send(err);
    }
    var metadata = parseQuestionMetadata(result);
    res.send(metadata);
  });
});

orgs.get('/:id/users', function (req, res) {
  var query = Users.find({
    'orgs.org': req.org
  });
  if (req.query.count !== undefined) {
    query = query.count();
  }
  query.exec(function (err, results) {
    if (err) {
      return res.send(err);
    }
    res.send(200, results);
  });
});

