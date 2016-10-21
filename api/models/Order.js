/**
 * Order.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
  	creator: { model: 'user', required: true },
  	assignee: { model: 'user', required: true },
  	assignedOn: { type: 'datetime', defaultsTo: function() { return new Date(); }, required: true },
  	deliveredOn: { type: 'datetime' },
  	order: { model: 'document' },
  	protocol: { model: 'document' },
  	receipt: { model: 'document' },
  }
};

