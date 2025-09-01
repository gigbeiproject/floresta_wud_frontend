export const AUTH_CONSTANTS = {
  JWT_EXPIRES_IN: '7d',
  OTP_EXPIRES_IN: 10, // minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW: 60, // minutes
  SESSION_CLEANUP_INTERVAL: 24, // hours
  
  ERROR_MESSAGES: {
    INVALID_PHONE: 'Please enter a valid 10-digit mobile number',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PASSWORD: 'Password must be at least 6 characters',
    INVALID_NAME: 'Name must be at least 2 characters',
    INVALID_OTP: 'Please enter a valid 6-digit OTP',
    USER_EXISTS: 'User already exists with this phone or email',
    USER_NOT_FOUND: 'User not found with this phone number',
    INVALID_CREDENTIALS: 'Invalid phone or password',
    ACCOUNT_DEACTIVATED: 'Account is deactivated',
    TOO_MANY_ATTEMPTS: 'Too many failed login attempts. Please try again later.',
    OTP_EXPIRED: 'Invalid or expired reset code',
    PASSWORD_MISMATCH: 'Passwords do not match',
    TOKEN_INVALID: 'Invalid or expired token',
    SESSION_EXPIRED: 'Session expired',
    SMS_FAILED: 'Failed to send SMS',
    SERVER_ERROR: 'Server error. Please try again later.'
  },

  SUCCESS_MESSAGES: {
    REGISTRATION_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    OTP_SENT: 'Password reset code sent successfully',
    OTP_VERIFIED: 'Reset code verified successfully',
    PASSWORD_RESET: 'Password reset successfully',
    LOGOUT_SUCCESS: 'Logged out successfully'
  }
};