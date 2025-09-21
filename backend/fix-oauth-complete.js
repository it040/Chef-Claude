require('dotenv').config();

console.log('🔧 Complete OAuth Fix Script');
console.log('============================\n');

// Step 1: Check current configuration
console.log('📋 Step 1: Current Configuration Check');
console.log('- Client ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Present' : '❌ Missing');
console.log('- Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Present' : '❌ Missing');
console.log('- Callback URL:', process.env.GOOGLE_CALLBACK_URL);
console.log('- Frontend URL:', process.env.FRONTEND_URL);

// Step 2: Identify the problem
console.log('\n🚨 Step 2: Problem Analysis');
console.log('TokenError: Unauthorized typically means:');
console.log('1. ❌ OAuth credentials are invalid or expired');
console.log('2. ❌ Redirect URI mismatch in Google Console');
console.log('3. ❌ OAuth consent screen not properly configured');
console.log('4. ❌ Application not verified or test users not added');

// Step 3: Google Cloud Console Instructions
console.log('\n🔧 Step 3: Fix Google Cloud Console Settings');
console.log('==============================================');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('2. Select your project or create a new one');
console.log('3. Create or edit OAuth 2.0 Client ID');
console.log('4. Set Application type: Web application');
console.log('5. Add Authorized redirect URIs:');
console.log('   - http://localhost:5000/api/auth/google/callback');
console.log('   - http://127.0.0.1:5000/api/auth/google/callback');
console.log('');
console.log('6. Configure OAuth Consent Screen:');
console.log('   - User Type: External (for testing) or Internal');
console.log('   - Fill required fields (App name, User support email, etc.)');
console.log('   - Add test users if using External type');
console.log('   - Scopes: Add "email" and "profile"');

// Step 4: Generate new .env template
console.log('\n📝 Step 4: Update Environment Variables');
console.log('=====================================');
console.log('After creating OAuth client, update your .env file:');
console.log('');
console.log('GOOGLE_CLIENT_ID=your-new-client-id.apps.googleusercontent.com');
console.log('GOOGLE_CLIENT_SECRET=your-new-client-secret');
console.log('GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback');
console.log('FRONTEND_URL=http://localhost:5173');
console.log('SESSION_SECRET=chef-claude-session-secret-2025');

// Step 5: Clear browser data
console.log('\n🧹 Step 5: Clear Browser Data');
console.log('============================');
console.log('1. Clear browser cache and cookies for localhost');
console.log('2. Try incognito/private browsing mode');
console.log('3. Try a different browser');

// Step 6: Test instructions
console.log('\n🧪 Step 6: Testing Instructions');
console.log('==============================');
console.log('1. Stop any running server instances');
console.log('2. Restart server: node chef-claude-server.js');
console.log('3. Visit: http://localhost:5000/api/auth/google');
console.log('4. Should redirect to Google login page');
console.log('5. After login, should redirect back to frontend');

console.log('\n⚡ Quick Fixes to Try First:');
console.log('1. Regenerate OAuth client credentials');
console.log('2. Add test user email to OAuth consent screen');
console.log('3. Verify exact redirect URI match');
console.log('4. Clear browser cache');

console.log('\n✅ Success Indicators:');
console.log('- No "TokenError: Unauthorized" in console');
console.log('- Successful redirect to frontend after Google login');
console.log('- User data visible in database after authentication');

console.log('\n🆘 If Still Not Working:');
console.log('1. Check Google Cloud Console audit logs');
console.log('2. Verify project billing is enabled');
console.log('3. Ensure Google+ API is enabled (legacy requirement)');
console.log('4. Try creating a completely new OAuth client');

// Current credentials check
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('\n🔍 Current Credentials Analysis:');
    const clientId = process.env.GOOGLE_CLIENT_ID;
    console.log('Client ID format check:', clientId.endsWith('.apps.googleusercontent.com') ? '✅ Valid format' : '❌ Invalid format');
    console.log('Client ID project:', clientId.split('-')[0]);
} else {
    console.log('\n❌ OAuth credentials missing - check .env file');
}