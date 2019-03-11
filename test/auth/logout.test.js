// helpers
const { loginTestUser } = require('../lib/helpers');

/*
 *  Test /auth/logout
 */
const login = ({ chai, server }) => describe('/logout', () => {
  // Session token
  let token;
  before(async () => {
    ({ body: { token } } = await loginTestUser(chai, server));
  });

  it('it should logout', (done) => {
    chai.request(server)
      .post('/auth/logout')
      .set('Content-Type', 'application/json')
      .set('authorization', `Bearer ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('success').eql(true);
        res.body.should.have.property('messageCode').eql('srv003');
        res.body.should.have.property('message').eql('Successful log out');
        res.body.should.have.property('user').eql({});
        done();
      });
  });
});

module.exports = login;
