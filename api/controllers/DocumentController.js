/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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
  upload: function (req, res) {
  	console.log('Uploading: ', req);
    return res.sendStatus(200);
  }
	
};

