// Quick Resend test script
// Run with: node test-resend.js

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  try {
    console.log('Testing Resend email service...\n');
    
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: ['delivered@resend.dev'], // Resend test email
      subject: 'TOMO Email Service Test',
      html: '<h1>✅ Email service is working!</h1><p>Your TOMO app can now send emails.</p>'
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('Email ID:', data.id);
    console.log('\nCheck your Resend dashboard: https://resend.com/emails');
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
  }
}

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY is not set in environment variables');
  process.exit(1);
}

testResend();
