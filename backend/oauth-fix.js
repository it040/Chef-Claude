require('dotenv').config();

console.log('🔍 OAuth Configuration Diagnostic Tool');
console.log('=====================================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'Using default');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Using default');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing');

console.log('\n🔧 Current Configuration:');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);
console.log('Frontend URL:', process.env.FRONTEND_URL);

// Common issues and fixes
console.log('\n🚨 Common OAuth Issues & Fixes:');
console.log('1. ❌ TokenError: Unauthorized - Usually indicates:');
console.log('   - Invalid client credentials');
console.log('   - Incorrect redirect URI in Google Cloud Console');
console.log('   - OAuth consent screen not properly configured');

console.log('\n2. 🔧 Required Google Cloud Console Settings:');
console.log('   - OAuth 2.0 Client ID created');
console.log('   - Authorized redirect URIs must include:');
console.log('     * http://localhost:5000/api/auth/google/callback');
console.log('   - OAuth consent screen configured (Internal or External)');
console.log('   - Test users added (if consent screen is External)');

console.log('\n3. 📝 Scopes being requested:');
console.log('   - profile');
console.log('   - email');

console.log('\n💡 Suggested Actions:');
console.log('1. Verify Google Cloud Console OAuth 2.0 client configuration');
console.log('2. Check that redirect URI exactly matches: http://localhost:5000/api/auth/google/callback');
console.log('3. Ensure OAuth consent screen is published or test users are added');
console.log('4. Regenerate client secret if needed');
console.log('5. Clear browser cache and cookies for localhost');

// Generate new client configuration suggestion
console.log('\n🔄 Regenerate OAuth Credentials:');
console.log('1. Go to Google Cloud Console > Credentials');
console.log('2. Delete existing OAuth 2.0 client');
console.log('3. Create new OAuth 2.0 client with these settings:');
console.log('   - Application type: Web application');
console.log('   - Authorized redirect URIs: http://localhost:5000/api/auth/google/callback');
console.log('4. Update .env with new CLIENT_ID and CLIENT_SECRET');

console.log('\n🧪 To test after fixing:');
console.log('1. Restart the server: node chef-claude-server.js');
console.log('2. Visit: http://localhost:5000/api/auth/google');
console.log('3. Should redirect to Google login without errors');