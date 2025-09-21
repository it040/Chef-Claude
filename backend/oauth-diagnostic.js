require('dotenv').config();

console.log('🔍 Google OAuth Diagnostic Tool\n');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

console.log('📋 Current Configuration:');
console.log(`   Client ID: ${clientId ? clientId.substring(0, 20) + '...' : '❌ Not set'}`);
console.log(`   Client Secret: ${clientSecret ? '✅ Set (' + clientSecret.length + ' chars)' : '❌ Not set'}`);
console.log(`   Callback URL: ${callbackUrl || '❌ Not set'}\n`);

console.log('🎯 Required Redirect URIs in Google Console:');
console.log('   1. http://localhost:5000/api/auth/google/callback (production)');
console.log('   2. http://localhost:5001/auth/google/callback (testing)\n');

console.log('🔧 Common "Restricted Access" Fixes:');
console.log('   1. Add your email as test user in OAuth consent screen');
console.log('   2. Verify redirect URIs match exactly (including http://)');
console.log('   3. Enable Google+ API (deprecated but sometimes needed)');
console.log('   4. Check if app needs verification for production use\n');

console.log('🌐 Google Console URLs:');
console.log('   OAuth Consent: https://console.cloud.google.com/apis/credentials/consent');
console.log('   Credentials: https://console.cloud.google.com/apis/credentials\n');

if (!clientId || !clientSecret) {
  console.log('❌ Missing OAuth credentials! Set them in your .env file');
  process.exit(1);
}

console.log('✅ Credentials are configured. If still getting "restricted access":');
console.log('   → Check Google Console settings above');
console.log('   → Make sure your email is added as a test user');