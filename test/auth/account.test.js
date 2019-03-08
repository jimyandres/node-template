/*
 *  Test /account/activate/resend
 */
const account = ({ chai, nodemailerMock, server }) => describe('/account', () => {
  // test email
  const email = 'temporal.test.acc@gmail.com';
  const wrongEmail = 'wrongmail@mail.com';

  // Reset nodemailer-mock class
  before(() => {
    nodemailerMock.mock.reset();
  });

  describe('/activate', () => {
    describe('/resend', () => {
      it('it should resend the account activation link', (done) => {
        chai.request(server)
          .post('/auth/account/activate/resend')
          .send({ email })
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('messageCode');
            res.body.should.have.property('message');
            done();

            // get the array of emails we sent
            const sentMail = nodemailerMock.mock.sentMail();

            // we should have sent one email
            sentMail.should.have.lengthOf(1);
            const [mail] = sentMail;
            mail.context.should.have.property('url');
          });
      });

      it('it should not resend the email (email does not exist)', (done) => {
        chai.request(server)
          .post('/auth/account/activate/resend')
          .send({ email: wrongEmail })
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(422);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            res.body.should.have.property('error');
            res.body.error.should.have.property('errorCode').eql('srv005');
            res.body.error.should.have.property('message').eql('Error sending the account activation email');
            done();
          });
      });
    });

    describe('/:token', () => {
      // Get the activation token from the mail sent
      let activationToken;
      it('it should activate the account', (done) => {
        const [sentMail] = nodemailerMock.mock.sentMail();
        activationToken = sentMail.context.url.split('/').pop();
        chai.request(server)
          .get(`/auth/account/activate/${activationToken}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('messageCode');
            res.body.should.have.property('message');
            done();
          });
      });

      it('it should return error (account already activated)', (done) => {
        chai.request(server)
          .get(`/auth/account/activate/${activationToken}`)
          .set('Content-Type', 'application/json')
          .end((err, res) => {
            res.should.have.status(422);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            res.body.should.have.property('error');
            res.body.error.should.have.property('errorCode');
            res.body.error.should.have.property('message');
            done();
          });
      });
    });
  });
});

module.exports = account;
