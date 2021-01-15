/*
  This file is used to store unsecure, application-specific data common to all
  environments.
*/

module.exports = {
  port: process.env.PORT || 5001,

  // Password for access the web-based logs.
  logPass: 'test',

  // Email server info used or sending out email notifications.
  emailServer: process.env.EMAILSERVER ? process.env.EMAILSERVER : 'mail.someserver.com',
  emailUser: process.env.EMAILUSER ? process.env.EMAILUSER : 'noreply@someserver.com',
  emailPassword: process.env.EMAILPASS ? process.env.EMAILPASS : 'emailpassword',

  // mnemonic representing the wallet controlled by this app.
  mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : 'maximum dance fade coyote faith bundle panther amazing solve decrease display worth'
}
