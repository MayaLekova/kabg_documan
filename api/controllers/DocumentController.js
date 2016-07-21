/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require('path');
var fs = require('fs');

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
          {"name" : files[0].filename,
            "owner" : req.user.username,
            "path" : path.basename(files[0].fd),
            "type" : req.query.type
          })
          .exec(function (err, created){
            if(err) console.error(err);
            Notifications.create(
            [{
              text: 'Потребителят ' + req.user.username + ' създаден нов(а) ' + req.query.type,
              path: path.basename(files[0].fd),
              toUser: 'Maya'  // TODO: add all system admins from local.js
            }, 
            {
              text: 'Потребителят ' + req.user.username + ' създаден нов(а) ' + req.query.type,
              path: path.basename(files[0].fd),
              toUser: 'Stanislava'
            }]).exec(function (err, notifsCreated) {
              if(err) console.error(err);
              return res.json({
                message: files.length + ' file(s) uploaded successfully!',
                files: files
              });
            });
          });
      }
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

