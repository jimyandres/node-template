const rewiremock = require('rewiremock').default;
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const nodemailerMock = require('nodemailer-mock');

const { Mockgoose } = require('mockgoose');

const mockgoose = new Mockgoose(mongoose);

// Set appName and environment config
process.argv[2] = '@PROJECT_WS';
process.env.NODE_ENV = 'test';

before((done) => {
  // mock connection to DB
  mockgoose.prepareStorage().then(() => {
    mongoose.connect('mongodb://localhost:27017/@project-ws-test', {
      useCreateIndex: true,
      useNewUrlParser: true,
    }, err => done(err));
  });
});

rewiremock('nodemailer')
  .with(nodemailerMock);

rewiremock.enable();
const server = require('../../app');

rewiremock.disable();

// Mock Http requests
// require JS as follow require('./smartContract');

const should = chai.should();
// use chai-http middleware
chai.use(chaiHttp);

module.exports = {
  chai,
  server,
  nodemailerMock,
  should,
};
