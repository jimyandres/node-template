# NodeJS Web Service Template

This is a template for a Web Service Project in NodeJS

# Features

This is the list of features implemented in this repo

## User Authentication (endpoints)

- Registration
- Account Activation via Email
- Login/Logout
- Password reset via Email

## User management (endpoints)

- Update user data:
  - By owner
  - By Admin
- Get list of users

## Translation

- Translate server responses (errors, messages) to different languages using i18next.

## Clustering

- Take advantage of multiple processors if they’re available. The Cluster module allows you to create a small network of separate processes which can share server ports

## Testing

- 29 test scenarios using Mocha, Mockgoose, Nock, Chai and others.

## ESLint

- Tool for identifying and reporting on patters found in ECMAScript/JavaScript code

# Dependencies

These are some dependencies used in this repo

[JWT](https://github.com/auth0/node-jsonwebtoken)
- An open, industry standard RFC 7519 method for representing claims securely between two parties.

[mongoose](https://mongoosejs.com/docs/guide.html)
- MongoDB object modeling for node.js.

[passport-jwt](https://github.com/themikenicholson/passport-jwt)
- Authenticate endpoints using a JSON web token. It is intended to be used to secure RESTful endpoints without sessions.

[Passport-Local Mongoose](https://github.com/saintedlama/passport-local-mongoose)
- A Mongoose plugin that simplifies building username and password login with Passport.

[Mocha](https://mochajs.org/)
- Simple, flexible, fun JavaScript test framework for Node.js & The Browser.

[Mockgoose](https://github.com/Mockgoose/Mockgoose)
- It provides test database by spinning up `mongod` on the back when mongoose.connect call is made. By default it is using in memory store which does not have persistence.

[Nock](https://github.com/nock/nock)
- HTTP server mocking and expectations library for Node.js.

[Chai](https://github.com/chaijs/chai)
- Chai is a BDD / TDD assertion library for node and the browser that can be delightfully paired with any javascript testing framework.

[Chai HTTP](https://github.com/chaijs/chai-http)
- HTTP integration testing with Chai assertions.

[i18next](https://github.com/i18next/i18next)
- A very popular internationalization framework for browser or any other javascript environment.

[Joi](https://github.com/hapijs/joi)
- Object schema description language and validator for JavaScript objects.

[Nodemailer](https://github.com/nodemailer/nodemailer)
- Send e-mails from Node.js

# Instructions

- Clone project

```
git clone https://gitlab.com/evogit/templates/template-node.git
```

- Install dependencies

```
npm install
# or
yarn
```

- Set-up the application name. Find and replace in the whole project:

  - `PROJECT_NAME` with your application's name in UPPERCASE e.g. `MY_NODE_PROJECT`.
  - `project-name` with your application's name in lowercase e.g. `my-node-project`.
  - Or change it as you prefer.

- Set-up the `.env` file located in the project's root.

- Run application

```
npm start
# or
yarn start
```

- To run the test cases

```
npm test
# or
yarn test
```
