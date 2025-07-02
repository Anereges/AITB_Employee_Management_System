const bcrypt = require('bcryptjs');
const password = 'AAAaaa@19';
const saltRounds = 12;

bcrypt.hash(password, saltRounds)
  .then(hash => {
    console.log('Hashed password:', hash);
  })
  .catch(err => {
    console.error('Error:', err);
  });