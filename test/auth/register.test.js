/*
 *  Test /auth/register
 */
const register = ({ chai, nodemailerMock, server }) => describe('/register', async () => {
  // New user data
  const newUser = {
    email: 'temporal.test.acc@gmail.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'Temporal123',
    phoneNumber: '+573148938578',
    birthDate: '1994-01-01',
  };

  it('it should register a new user', (done) => {
    chai.request(server)
      .post('/auth/register')
      .send(newUser)
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

  it('it should had sent an email with the activation link', () => {
    // get the array of emails we sent
    const sentMail = nodemailerMock.mock.sentMail();

    // we should have sent one email
    sentMail.should.have.lengthOf(1);
    const [mail] = sentMail;
    mail.context.should.have.property('url');
  });

  it('it should not register a new user - email already exists', (done) => {
    chai.request(server)
      .post('/auth/register')
      .send(newUser)
      .set('Content-Type', 'application/json')
      .end(async (err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('success').eql(false);
        res.body.should.have.property('error');
        res.body.error.should.have.property('errorCode');
        res.body.error.should.have.property('message');
        done();
      });
  });

  it('it should register a second user', (done) => {
    newUser.email = 'test2@mail.com';
    chai.request(server)
      .post('/auth/register')
      .send(newUser)
      .set('Content-Type', 'application/json')
      .end(async (err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('success').eql(true);
        res.body.should.have.property('messageCode');
        res.body.should.have.property('message');
        done();
      });
  });
});

module.exports = register;
