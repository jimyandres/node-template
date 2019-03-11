/**
 * Login a test user
 * @param {*} chai
 * @param {*} server
 * @param {String} token - jwt auth token
 */
const loginTestUser = (chai, server, password = 'Temporal123') => chai.request(server)
  .post('/auth/login')
  .send({
    email: 'temporal.test.acc@gmail.com',
    password,
  })
  .set('Content-Type', 'application/json');

module.exports = {
  loginTestUser,
};
