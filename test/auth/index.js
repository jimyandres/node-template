const Account = require('./account.test');
const Login = require('./login.test');
const Logout = require('./logout.test');
const Register = require('./register.test');
const Password = require('./password.test');

const auth = setup => describe('/auth', () => {
  Register(setup);
  Account(setup);
  Login(setup);
  Logout(setup);
  Password(setup);
});

module.exports = auth;
