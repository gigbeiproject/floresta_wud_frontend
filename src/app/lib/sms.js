// File: lib/sms.js (Mock SMS service - replace with actual provider)
export const sendSMS = async (phone, message) => {
  // Mock implementation - replace with actual SMS provider like Twilio, AWS SNS, etc.
  console.log(`SMS to +91${phone}: ${message}`);
  
  // For testing purposes, always return success
  return { success: true, messageId: 'mock-message-id' };
  
  // Example with Twilio:
  /*
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  
  try {
    const message = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`
    });
    return { success: true, messageId: message.sid };
  } catch (error) {
    return { success: false, error: error.message };
  }
  */
};
