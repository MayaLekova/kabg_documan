/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');
var fs = require('fs');
var local = require('../../config/local.js');
var ObjectId = require('mongodb').ObjectID

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
    req.file('document').upload(function (err, files) {
      if (err)
        return res.serverError(err);

      if(files.length >= 1) {
        Document.create(
          { name : files[0].filename,
            owner : req.user.username,
            path : path.basename(files[0].fd),
            type : req.query.type,
            signedByUser: true,
            signedByAdmin: !!req.query.signedByAdmin,
          })
          .exec(function (err, created){
            if(err) console.error(err);
            Notifications.create(local.admins.map(function(adminName) {
              return {
                text: 'Потребителят ' + req.user.username + ' качи нов(а) ' + docTypeToReadable[req.query.type],
                path: path.basename(files[0].fd),
                toUser: adminName,
                doc_id: created.id,
              }
            })).exec(function (err, notifsCreated) {
              if(err) console.error(err);
              return res.redirect('/');
            });
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
  }
};

