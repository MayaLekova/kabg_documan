/**
 * Notifications.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    text  : { type: 'string', required: true },
    path  : { type: 'string', required: true },
    dismissed  : { type: 'boolean', defaultsTo: function() { return false; } },
    toUser : { type: 'string', required: true },
    doc_id: { model: 'document', required: true }
  }
};

