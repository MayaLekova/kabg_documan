/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');
var fs = require('fs');
var local = require('../../config/local.js');
var ObjectId = require('mongodb').ObjectID;

var docTypeToReadable = {
  "contract": "договор",
  "declaration": "декларация",
  "order": "поръчка",
  "protocol": "протокол",
}

module.exports = {
  /**
   * `DocumentController.list()`
   */
  list: function (req, res) {
	  Document.find({owner: req.user.username}, function(err, data) {
	  	return res.json(data);
	  });
  },

  /**
   * `DocumentController.upload()`
   */
  upload: function  (req, res) {
    req.file('document').upload({ saveAs: function(fileStream, cb) {
      function padTo2(num) {
        return num <= 9 ? '0' + num : '' + num;
      }

      var ret = docTypeToReadable[req.query.type] + '_';
      ret += (req.query.originalOwner ? req.query.originalOwner : req.user.username);
      ret += '_';

      var d = new Date();
      ret += (d.getUTCFullYear() + padTo2(d.getUTCMonth()) + padTo2(d.getUTCDate()));
      ret += path.extname(fileStream.filename);
      cb(null, ret);
    } }
      , function (err, files) {
      if (err)
        return res.serverError(err);

      if(files.length >= 1) {
        Document.create(
          { name : files[0].filename,
            owner : (req.query.originalOwner ? req.query.originalOwner : req.user.username),
            path : path.basename(files[0].fd),
            type : req.query.type,
            signedByUser: true,
            signedByAdmin: !!req.query.signedByAdmin,
          })
          .exec(function (err, created){
            if(err) return console.error(err);
            if(!created.signedByAdmin) {
              Notifications.create(local.admins.map(function(adminName) {
                return {
                  text: 'Потребителят ' + req.user.username + ' качи нов(а) ' + docTypeToReadable[req.query.type],
                  path: path.basename(files[0].fd),
                  toUser: adminName,
                  doc_id: created.id,
                };
              })).exec(function (err, notifsCreated) {
                if(err) console.error(err);
                return res.redirect('/');
              });
            } else {
              return res.redirect('/');
            }
          });
      }
    });
  },

  update: function(req, res) {
    Document.findOne({ id: req.params.doc_id }).exec(function(err, found) {
      if(err || !found) {
        return res.serverError(err || new Error('Cannot find such document'));
      }
      res.view('update_doc', {doc: found});
    });
  },

  /**
   * `DocumentController.upload()`
   */
  download: function(req, res) {
    var basePath = path.join(__dirname, '../../.tmp/uploads/');
    try {
      rs = fs.createReadStream(path.join(basePath, req.params.doc_path));
      rs.pipe(res);
    } catch(err) {
        return res.serverError(err);
    }
  },

  send: function (req, res) {
    Document.update({ id: req.params.doc_id }, { sent: true }).exec(function(err, updated) {
      if(err) {
        return res.serverError(err);
      }
      return res.redirect('/');
    });
  },

  pay: function (req, res) {
    Document.update({ id: req.params.doc_id }, { paid: true }).exec(function(err, updated) {
      if(err) {
        return res.serverError(err);
      }
      return res.redirect('/');
    });
  },
  
  unsent: function (req, res) {
    Document.find({ sent: false, signedByAdmin: true }).exec(function(err, found) {
      return res.view('unsent', { documents: found });
    });
  },
  
  unpaid: function (req, res) {
    Document.find({ paid: false, signedByAdmin: true }).exec(function(err, found) {
      return res.view('unpaid', { documents: found });
    });
  },
  
  ready: function (req, res) {
    Document.find({ paid: true, sent: true, signedByAdmin: true }).exec(function(err, found) {
      return res.view('ready', { documents: found });
    });
  }

};

