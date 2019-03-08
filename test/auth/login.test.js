/*
 *  Test /auth/login
 */
const login = ({ chai, server }) => describe('/login', () => {
  it('it should login', (done) => {
    chai.request(server)
      .post('/auth/login')
      .send({
        email: 'temporal.test.acc@gmail.com',
        password: 'Temporal123',
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

  it('it should not login - account not activated', (done) => {
    chai.request(server)
      .post('/auth/login')
      .send({
        email: 'test2@mail.com',
        password: 'Temporal123',
      })
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.a('object');
        res.body.should.have.property('success').eql(false);
        res.body.should.not.have.property('token');
        res.body.should.have.property('error');
        res.body.error.should.have.property('errorCode').eql('usr015');
        res.body.error.should.have.property('message').eql('Your account has not been yet activated');
        done();
      });
  });

  it('it should not login - wrong password', (done) => {
    chai.request(server)
      .post('/auth/login')
      .send({
        email: 'temporal.test.acc@gmail.com',
        password: 'Wrongpass123',
      })
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.be.a('object');
        res.body.should.have.property('success').eql(false);
        res.body.should.not.have.property('token');
        res.body.should.have.property('error');
        res.body.error.should.have.property('errorCode').eql('usr003');
        res.body.error.should.have.property('message').eql('Invalid email/password combination. Please try again.');
        done();
      });
  });
});

module.exports = login;
