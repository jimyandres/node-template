// Helpers
const { loginTestUser } = require('../lib/helpers');

// Models
const User = require('../../models/user');

const users = setup => describe('/users', () => {
  const { chai, server, should } = setup;

  // Session
  let token;
  let userId;
  let otherId;
  before(async () => {
    ({ body: { token, user: { _id: userId } } } = await loginTestUser(chai, server, 'Temporal321'));
    ({ _id: otherId } = await User.findOne({ email: 'test2@mail.com' }));
  });

  describe('No Admin user', () => {
    it('it should not get all users - no user logged in', (done) => {
      chai.request(server)
        .get('/users')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('error');
          res.body.error.should.have.property('errorCode').eql('usr005');
          res.body.error.should.have.property('message').eql('Authentication error. You are not logged in');
          done();
        });
    });

    it('it should not get all users - no admin user', (done) => {
      chai.request(server)
        .get('/users')
        .set('Content-Type', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(403);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('error');
          res.body.error.should.have.property('errorCode').eql('usr006');
          res.body.error.should.have.property('message').eql('Only administrators are allowed to perform this operation');
          done();
        });
    });

    describe('/:userId', () => {
      it('it should get its own user info', (done) => {
        chai.request(server)
          .get(`/users/${userId}`)
          .set('Content-Type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('user').to.be.an('object');
            res.body.user.should.have.property('_id').eql(userId);
            done();
          });
      });

      it('it should not get another user info', (done) => {
        chai.request(server)
          .get(`/users/${otherId}`)
          .set('Content-Type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            res.body.should.have.property('error');
            res.body.error.should.have.property('errorCode').eql('usr008');
            res.body.error.should.have.property('message').eql('You are not authorized to perform this operation');
            done();
          });
      });

      it('it should updates its own user info', (done) => {
        chai.request(server)
          .put(`/users/${userId}`)
          .set('Content-Type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send({
            email: 'temporal.test.acc@gmail.com',
            firstName: 'Other',
            lastName: 'Name',
            phoneNumber: '+573123456789',
            birthDate: '1994-01-01',
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('userUpdated').to.be.an('object');
            res.body.userUpdated.should.have.property('firstName').eql('other');
            res.body.userUpdated.should.have.property('_id').eql(userId);
            done();
          });
      });

      it('it should not update another user info', (done) => {
        chai.request(server)
          .put(`/users/${otherId}`)
          .set('Content-Type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send({
            email: 'test2@mail.com',
            firstName: 'Other',
            lastName: 'Name',
            phoneNumber: '+573123456789',
            birthDate: '1994-01-01',
          })
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('success').eql(false);
            res.body.should.have.property('error');
            res.body.error.should.have.property('errorCode').eql('usr008');
            res.body.error.should.have.property('message').eql('You are not authorized to perform this operation');
            done();
          });
      });

      it('it should not update its own user info with an existing email', (done) => {
        chai.request(server)
          .put(`/users/${userId}`)
          .set('Content-Type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send({
            email: 'test2@mail.com',
            firstName: 'Other',
            lastName: 'Name',
            phoneNumber: '+573123456789',
            birthDate: '1994-01-01',
          })
          .end((err, res) => {
            res.should.have.status(422);
            res.body.should.be.an('object');
            res.body.should.have.property('success').eql(false);
            res.body.should.have.property('error');
            res.body.error.should.have.property('errorCode').eql('usr004');
            res.body.error.should.have.property('message').eql('A user with the given email is already registered');
            User.findOne({ email: 'temporal.test.acc@gmail.com' }, (error, user) => {
              if (error) done(error);
              user.should.be.an('object');
              user.should.have.property('_id');
              user._id.toString().should.be.eql(userId);
              done();
            });
          });
      });
    });
  });

  describe('Admin user', () => {
    before((done) => {
      User.updateOne({ email: 'temporal.test.acc@gmail.com' }, { $set: { admin: true } }, done);
    });

    after((done) => {
      User.updateOne({ email: 'temporal.test.acc@gmail.com' }, { $set: { admin: false } }, done);
    });

    it('it should get all users', (done) => {
      chai.request(server)
        .get('/users')
        .set('Content-Type', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('users');
          res.body.users.should.be.an('array');
          done();
        });
    });

    describe('/:userId', () => {
      it('it should get another user info', (done) => {
        chai.request(server)
          .get(`/users/${otherId}`)
          .set('Content-Type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('user').to.be.an('object');
            res.body.user.should.have.property('_id').eql(otherId.toString());
            done();
          });
      });

      it('it should updates another user info', (done) => {
        chai.request(server)
          .put(`/users/${otherId}`)
          .set('Content-Type', 'application/json')
          .set('authorization', `Bearer ${token}`)
          .send({
            email: 'test2@mail.com',
            firstName: 'OtherTest',
            lastName: 'Name',
            phoneNumber: '+573123456789',
            birthDate: '1994-01-01',
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('userUpdated').to.be.an('object');
            res.body.userUpdated.should.have.property('firstName').eql('othertest');
            res.body.userUpdated.should.have.property('_id').eql(otherId.toString());
            User.findOne({ email: 'test2@mail.com' }, (error, user) => {
              if (error) done(error);
              should.exist(user);
              user.should.have.property('_id');
              user._id.toString().should.be.eql(otherId.toString());
              done();
            });
          });
      });
    });
  });
});

module.exports = users;
