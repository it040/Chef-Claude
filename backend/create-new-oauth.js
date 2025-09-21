console.log('🔧 Google OAuth Credentials Setup Guide');
console.log('==========================================\n');

console.log('❌ Current Issue: TokenError: Unauthorized');
console.log('✅ Solution: Create fresh OAuth credentials\n');

console.log('📋 STEP 1: Access Google Cloud Console');
console.log('======================================');
console.log('1. Open: https://console.cloud.google.com/');
console.log('2. Select or create a project for Chef Claude');
console.log('3. Note your project ID for reference\n');

console.log('🔧 STEP 2: Enable Required APIs');
console.log('===============================');
console.log('1. Go to: APIs & Services > Library');
console.log('2. Search and enable: "Google+ API" (legacy but required)');
console.log('3. Search and enable: "People API"');
console.log('4. Wait for APIs to be enabled\n');

console.log('🔐 STEP 3: Configure OAuth Consent Screen');
console.log('=========================================');
console.log('1. Go to: APIs & Services > OAuth consent screen');
console.log('2. Choose "External" user type (for testing)');
console.log('3. Fill required information:');
console.log('   - App name: Chef Claude');
console.log('   - User support email: your-email@domain.com');
console.log('   - Developer contact: your-email@domain.com');
console.log('4. Click "Save and Continue"');
console.log('5. Scopes: Add "email" and "profile" scopes');
console.log('6. Test users: Add your email address');
console.log('7. Save all settings\n');

console.log('🔑 STEP 4: Create OAuth 2.0 Credentials');
console.log('=======================================');
console.log('1. Go to: APIs & Services > Credentials');
console.log('2. Click "Create Credentials" > "OAuth 2.0 Client ID"');
console.log('3. Application type: "Web application"');
console.log('4. Name: "Chef Claude OAuth Client"');
console.log('5. Authorized redirect URIs - Add EXACTLY:');
console.log('   http://localhost:5000/api/auth/google/callback');
console.log('6. Click "Create"');
console.log('7. COPY the Client ID and Client Secret\n');

console.log('📝 STEP 5: Update Environment File');
console.log('=================================');
console.log('Replace these values in your .env file:');
console.log('');
console.log('GOOGLE_CLIENT_ID=paste-new-client-id-here');
console.log('GOOGLE_CLIENT_SECRET=paste-new-client-secret-here');
console.log('GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback');
console.log('FRONTEND_URL=http://localhost:5173\n');

console.log('⚡ STEP 6: Quick Test');
console.log('====================');
console.log('1. Stop the current server (Ctrl+C)');
console.log('2. Restart: node chef-claude-server.js');
console.log('3. Test: http://localhost:5000/api/auth/google');
console.log('4. Should redirect to Google login without errors\n');

console.log('🚨 IMPORTANT NOTES:');
console.log('==================');
console.log('- OAuth credentials are PROJECT-SPECIFIC');
console.log('- Redirect URI must match EXACTLY (no trailing slash)');
console.log('- Test users must be added for External consent screen');
console.log('- Clear browser cache after updating credentials');
console.log('- Use incognito mode for testing\n');

console.log('🆘 If Still Not Working:');
console.log('========================');
console.log('1. Verify project has billing enabled');
console.log('2. Wait 5-10 minutes for changes to propagate');
console.log('3. Try a different Google account');
console.log('4. Check Google Cloud Console audit logs');

console.log('\n✅ Ready to create new credentials? Follow the steps above!');