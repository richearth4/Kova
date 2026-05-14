/**
 * SMS Notification Utility
 * 
 * This utility handles sending SMS messages. 
 * Currently implemented as a placeholder. Integration with providers 
 * like Twilio, Termii, or Africa's Talking can be added here.
 */

export async function sendSMS(phoneNumber: string, message: string) {
  try {
    const apiKey = process.env.TERMII_API_KEY;
    const senderId = process.env.TERMII_SENDER_ID || 'KOVA';

    if (!apiKey) {
      console.warn('[SMS] No TERMII_API_KEY found. Skipping SMS delivery.');
      return { success: false, error: 'No API key' };
    }

    // Format phone number (ensure it starts with 234 for Nigeria if not specified)
    let formattedNumber = phoneNumber.trim().replace(/\D/g, '');
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '234' + formattedNumber.slice(1);
    } else if (!formattedNumber.startsWith('234') && formattedNumber.length === 10) {
      formattedNumber = '234' + formattedNumber;
    }

    const payload = {
      api_key: apiKey,
      to: formattedNumber,
      from: senderId,
      sms: message,
      type: 'plain',
      channel: 'dnd',
    };

    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[SMS] Successfully sent to ${formattedNumber}: ${data.message_id}`);
      return { success: true, messageId: data.message_id };
    } else {
      console.error('[SMS] Termii Error:', data);
      return { success: false, error: data.message || 'Unknown error' };
    }
  } catch (error) {
    console.error('SMS delivery error:', error);
    return { success: false, error };
  }
}
