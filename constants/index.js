exports.userFields = [
  '_id',
  'email',
  'firstName',
  'lastName',
  'birthDate',
  'phoneNumber',
  'createdAt',
  'updatedAt',
  'admin',
  'walletId',
  'customerId',
];

exports.passwordPattern = '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$';
exports.namePattern = '^[a-zA-ZÀ-ž][\\sa-zA-ZÀ-ž]*$';

exports.expirationTimePasswordReset = 2; // value in hours
