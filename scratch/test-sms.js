const fs = require('fs');

async function testSMS() {
  // Read .env manually
  const envContent = fs.readFileSync('.env', 'utf8');
  const apiKeyMatch = envContent.match(/TERMII_API_KEY=(.*)/);
  const senderIdMatch = envContent.match(/TERMII_SENDER_ID=(.*)/);
  
  const apiKey = apiKeyMatch ? apiKeyMatch[1].replace(/["']/g, '').trim() : null;
  const senderId = senderIdMatch ? senderIdMatch[1].replace(/["']/g, '').trim() : 'KOVA';

  if (!apiKey) {
    console.error('❌ TERMII_API_KEY is not set in .env');
    return;
  }

  // YOUR PHONE NUMBER HERE
  const TEST_NUMBER = '08178775556'; 
  const TEST_MESSAGE = 'Hello from KOVA! Reverting back to Termii test.';

  // Format phone number
  let formattedNumber = TEST_NUMBER.trim().replace(/\D/g, '');
  if (formattedNumber.startsWith('0')) {
    formattedNumber = '234' + formattedNumber.slice(1);
  }

  console.log(`📡 Sending test SMS via Termii to ${formattedNumber}...`);

  const payload = {
    api_key: apiKey,
    to: formattedNumber,
    from: senderId,
    sms: TEST_MESSAGE,
    type: 'plain',
    channel: 'dnd',
  };

  try {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Termii SMS Sent Successfully!');
      console.log('Message ID:', data.message_id);
    } else {
      console.error('❌ Termii Error:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSMS();
