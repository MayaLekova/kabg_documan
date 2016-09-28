/**
 * Document.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name  : { type: 'string', required: true },
    path  : { type: 'string', required: true },
    type  : { type: 'string', enum: ['contract', 'declaration', 'order', 'protocol'], required: true },
    owner : { model: 'User', required: true },
    signedByUser : { type: 'boolean' },
    signedByAdmin : { type: 'boolean', defaultsTo: function() { return false; } },
    sent : { type: 'boolean', defaultsTo: function() { return false; } },
    paid : { type: 'boolean', defaultsTo: function() { return false; } },
    order : { model: 'Order' },
  }
};

