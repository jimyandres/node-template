module.exports = {
  /*
   * User-client errors
   */
  USER: {
    MissingPassword: 'usr001',
    MissingEmail: 'usr002',
    LoginUser: 'usr003',
    UserExists: 'usr004',
    NotLoggedIn: 'usr005',
    OnlyAdminAllowed: 'usr006',
    InvalidEmail: 'usr007',
    ForbiddenAction: 'usr008',
    AdminNotAllowed: 'usr009',
    AttemptTooSoon: 'usr010',
    TooManyAttempts: 'usr011',
    UserNotFound: 'usr012',
    InvalidHash: 'usr013',
    ActivationLink: 'usr014',
    AccountNotActivated: 'usr015',
    NotFound: 'usr016',
    InvalidProvidedData: 'usr017',
  },

  /*
   * Server errors
   */
  SERVER: {
    ActivationToken: 'srv001',
    ResendActivationToken: 'srv002',
    UpdateUser: 'srv003',
    PassResetHash: 'srv004',
  },
  DB: {
    RegisterUser: 'srv005',
    SetPassword: 'srv006',
    UpdateUser: 'srv007',
    Resource: 'srv008',
    CantGetUser: 'srv009',
  },

  /*
   * Network errors
   */
  NETWORK: {},

  /*
   * External error (external services)
   */
  EMAIL: {
    CantSendActivation: 'ext001',
    CantSendForgotPass: 'ext002',
  },

  /*
   * Unhandled errors
   */
  UNDEFINED: {},
};
