import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser,
  CognitoRefreshToken
} from 'amazon-cognito-identity-js';

export class CognitoClient {

  cognitoUserPool = null;
  username = '';
  accessToken = '';
  idToken = '';
  refreshToken = '';

  get cognitoUser() {
    if (!this.username) {
      return null;
    }
    return this.getCognitoUser(this.username);
  }

  constructor(userPoolId, clientId) {
    this.buildUserPool(userPoolId, clientId);
  }

  buildUserPool(userPoolId, clientId) {
    this.cognitoUserPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId
    });
  }

  getCognitoUser(username) {
    const userData = {
      Username : username,
      Pool : this.cognitoUserPool
    };
    return new CognitoUser(userData);
  }

  refreshSession() {
    if (!this.cognitoUserPool) {
      return {
        message: 'No user pool assigned'
      };
    }
    if (!this.username) {
      return {
        message: 'No Cognito User available for session refresh'
      };
    }
    let refreshToken = new CognitoRefreshToken(
      {
        RefreshToken: this.refreshTokenValue
      }
    );
    const cognitoUser = this.getCognitoUser(this.username);
    cognitoUser.refreshSession(RefreshToken, (err, session) => {
      if (err) {
        return {
          cognitoErrorCode: err.code,
          message: err.message
        };
      } else {
        this.idToken = session.getIdToken().getJwtToken();
        this.accessToken = session.getAccessToken().getJwtToken();
        this.refreshToken = session.getRefreshToken().getToken();
        return {
          message: 'Session has been refreshed.'
        };
      }
    });
  }

  login(email, password) {
    if (!this.cognitoUserPool) {
      return {
        message: 'No user pool assigned'
      };
    }
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });
    const cognitoUser = this.getCognitoUser(email);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        this.username = email;
        this.idToken = result.getIdToken().getJwtToken();
        this.accessToken = result.getAccessToken().getJwtToken();
        this.refreshToken = result.getRefreshToken().getToken();
        return {
          message: 'Cognito User has been logged in.'
        };
      },
      onFailure: (err) => {
        if (err.code === 'PasswordResetRequiredException') {          
          cognitoUser.forgotPassword({
            onSuccess: () => {
              return {
                message: 'Cognito User has been sent an email with password reset instructions.'
              };
            },
            onFailure: (forgotErr) => {
              return {
                cognitoErrorCode: forgotErr.code,
                message: forgotErr.message
              };
            },
          });
        } else {
          return {
            cognitoErrorCode: err.code,
            message: err.message
          }
        }
      },
      newPasswordRequired: () => {
        return {
          message: 'Cognito User must change password.'
        };
      },
    });
  }

  register(email, password) {
    if (!this.cognitoUserPool) {
      return {
        message: 'No user pool assigned'
      };
    }
    const emailParam = {
      Name: 'email',
      Value: email
    };
    const attributes = [];
    const emailAttribute = new CognitoUserAttribute(emailParam);
    attributes.push(emailAttribute);
    this.cognitoUserPool.signUp(emailParam.Value, password, attributes, null, (err, result) => {
      if (err) {
        return {
          cognitoErrorCode: err.code,
          message: err.message
        };
      }
      return {
        message: 'Cognito User Account created. Email sent to Cognito User for confirmation.'
      };
    });
  }

  confirmUser(userName, confirmationCode) {
    if (!this.cognitoUserPool) {
      return {
        message: 'No user pool assigned'
      };
    }
    const cognitoUser = new CognitoUser({
      Username: userName,
      Pool: this.cognitoUserPool
    });
    cognitoUser.confirmRegistration(confirmationCode, false, (err, result) => {
      if (err) {
        return {
          cognitoErrorCode: err.code,
          message: err.message
        };
      }
      return {
        message: 'Cognito User Account has been confirmed.'
      };
    });
  }

  forgotPassword(email) {
    if (!this.cognitoUserPool) {
      return {
        message: 'No user pool assigned'
      };
    }
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.cognitoUserPool
    });
    cognitoUser.forgotPassword({
      onSuccess: () => {
        return {
          message: 'Cognito User has been sent an email with password reset instructions.'
        };
      },
      onFailure: (err) => {
        return {
          cognitoErrorCode: err.code,
          message: err.message
        };
      },
    });
  }

  changePassword(email, oldPassword, newPassword) {
    if (!this.cognitoUserPool) {
      return {
        message: 'No user pool assigned'
      };
    }
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: oldPassword
    });
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.cognitoUserPool
    });
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: () => {
        return false;
      },
      onFailure: (err) => {
        return {
          cognitoErrorCode: err.code,
          message: 'Current password for this Cognito User is incorrect.'
        };
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
          onSuccess: () => {
            return {
              message: 'Password has been changed for this Cognito User.'
            };
          },
          onFailure: (err) => {
            return {
              cognitoErrorCode: err.code,
              message: err.message
            };
          },
        });
      },
    });
  }

  confirmPassword(username, verificationCode, password) {
    if (!this.cognitoUserPool) {
      return {
        message: 'No user pool assigned'
      };
    }
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.cognitoUserPool
    });
    cognitoUser.confirmPassword(verificationCode, password, {
      onSuccess: () => {
        return {
          message: 'Password has been changed for this Cognito User.'
        };
      },
      onFailure: (err) => {
        if (err.code === 'ExpiredCodeException') {
          return {
            cognitoErrorCode: err.code,
            message: 'Verification Code has expired. A new reset password request needs to be made.'
          };
        } else if (err.code === 'InvalidPasswordException') {
          return {
            cognitoErrorCode: err.code,
            message: err.message
          };
        } else {
          return {
            cognitoErrorCode: err.code,
            message: err.message
          };
        }
      }
    });
  }

}