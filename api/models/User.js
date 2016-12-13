var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username  : { type: 'string', unique: true },
    fullname  : { type: 'string' },
    email     : { type: 'email',  unique: true },
    crowdin  : { type: 'string' },
    facebook  : { type: 'string' },
    skype  : { type: 'string' },
    upwork  : { type: 'string' },
    passports : { collection: 'Passport', via: 'user' },
    entity: { type: 'boolean', defaultsTo: false, boolean: true },
  }
};

module.exports = User;
