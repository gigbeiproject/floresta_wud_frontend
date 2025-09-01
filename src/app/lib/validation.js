export const validators = {
  phone: (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password) => {
    return password && password.length >= 6;
  },

  name: (name) => {
    return name && name.trim().length >= 2;
  },

  otp: (otp) => {
    return /^\d{6}$/.test(otp);
  }
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};