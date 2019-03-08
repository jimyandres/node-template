/*
 * Test /auth/password
 */
const password = ({ chai, nodemailerMock, server }) => describe('/password', () => {
  // Reset the mock back to the defaults after each test
  before(() => nodemailerMock.mock.reset());

  describe('/forgot', () => {
    it('it should sent a password reset mail', (done) => {
      chai.request(server)
        .post('/auth/password/forgot')
        .send({ email: 'temporal.test.acc@gmail.com' })
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('messageCode').eql('srv001');
          res.body.should.have.property('message').eql('A restore link was sent to your email');
          done();
        });
    });

    it('it should not sent a password reset mail - wrong email', (done) => {
      chai.request(server)
        .post('/auth/password/forgot')
        .send({ email: 'wrogmail@mail.com' })
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('error');
          res.body.error.should.have.property('errorCode').eql('usr007');
          res.body.error.should.have.property('message').eql('Can not find that email');
          done();
        });
    });
  });

  describe('/reset', () => {
    let passResetToken;
    before((done) => {
      const [sentMail] = nodemailerMock.mock.sentMail();
      passResetToken = sentMail.context.url.split('/').pop();
      done();
    });

    describe('/:resetToken', () => {
      it('it should validate a password reset token', (done) => {
        chai.request(server)
          .get(`/auth/password/reset/${passResetToken}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('messageCode').eql('srv002');
            res.body.should.have.property('message').eql('Hash string is valid');
            done();
          });
      });

      it('it should validate a wrong password reset token', (done) => {
        chai.request(server)
          .get('/auth/password/reset/wrongRandomToken')
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(422);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            res.body.should.have.property('error');
            res.body.error.should.have.property('errorCode').eql('usr013');
            res.body.error.should.have.property('message').eql('The given hash is incorrect or has expired.');
            done();
          });
      });
    });

    describe('/', () => {
      it('it should set the new password', (done) => {
        chai.request(server)
          .post('/auth/password/reset')
          .send({ hash: passResetToken, password: 'Temporal321' })
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('messageCode').eql('srv006');
            res.body.should.have.property('message').eql('Successful password reset');
            done();
          });
      });

      it('it should not reset the new password - re-used token', (done) => {
        chai.request(server)
          .post('/auth/password/reset')
          .send({ hash: passResetToken, password: 'Temporal321' })
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(422);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            res.body.should.have.property('error');
            res.body.error.should.have.property('errorCode').eql('usr013');
            res.body.error.should.have.property('message').eql('The given hash is incorrect or has expired.');
            done();
          });
      });

      it('it should login with the new password', (done) => {
        chai.request(server)
          .post('/auth/login')
          .send({
            email: 'temporal.test.acc@gmail.com',
            password: 'Temporal321',
          })
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('token');
            res.body.should.have.property('message');
            done();
          });
      });
    });
  });
});

module.exports = password;
