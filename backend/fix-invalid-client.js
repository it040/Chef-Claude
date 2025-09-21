console.log('🚨 CRITICAL: Invalid OAuth Client Error');
console.log('========================================\n');

console.log('❌ ERROR: code: "invalid_client"');
console.log('This means your OAuth credentials are COMPLETELY INVALID');
console.log('Google doesn\'t recognize your Client ID and Secret.\n');

console.log('🔧 MANDATORY FIX: Delete and Recreate OAuth Client');
console.log('=================================================');

console.log('STEP 1: Delete Current OAuth Client');
console.log('-----------------------------------');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('2. Find your "Deep" OAuth 2.0 client');
console.log('3. Click the trash/delete icon');
console.log('4. Confirm deletion');
console.log('5. Wait for deletion to complete\n');

console.log('STEP 2: Create Brand New OAuth Client');
console.log('-------------------------------------');
console.log('1. Click "Create Credentials" > "OAuth 2.0 Client ID"');
console.log('2. Application type: "Web application"');
console.log('3. Name: "Chef Claude OAuth - New"');
console.log('4. Authorized JavaScript origins:');
console.log('   - Add: http://localhost:5173');
console.log('5. Authorized redirect URIs:');
console.log('   - Add ONLY: http://localhost:5000/api/auth/google/callback');
console.log('   - Do NOT add any other URIs!');
console.log('6. Click "Create"');
console.log('7. COPY the new Client ID and Client Secret\n');

console.log('STEP 3: Update OAuth Consent Screen');
console.log('-----------------------------------');
console.log('1. Go to: APIs & Services > OAuth consent screen');
console.log('2. Make sure you\'re added as a Test User');
console.log('3. Verify scopes include "email" and "profile"');
console.log('4. Save any changes\n');

console.log('STEP 4: Enable Required APIs');
console.log('----------------------------');
console.log('1. Go to: APIs & Services > Library');
console.log('2. Search and enable: "Google+ API"');
console.log('3. Search and enable: "People API"');
console.log('4. Wait for APIs to be fully enabled\n');

console.log('STEP 5: Update .env File');
console.log('------------------------');
console.log('Replace in your .env file:');
console.log('GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID');
console.log('GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET');
console.log('GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback\n');

console.log('⚡ ALTERNATIVE: Use Development Bypass');
console.log('=====================================');
console.log('While fixing OAuth, you can use the dev bypass:');
console.log('Visit: http://localhost:5000/api/auth/dev-login');
console.log('This logs you in without Google OAuth for testing.\n');

console.log('🧪 Test After Fixing:');
console.log('=====================');
console.log('1. Restart server: node chef-claude-server.js');
console.log('2. Clear browser cache and cookies');
console.log('3. Try: http://localhost:5000/api/auth/google');
console.log('4. Should redirect to Google login successfully\n');

console.log('💡 Key Points:');
console.log('- DELETE the old client completely');
console.log('- CREATE a brand new one');
console.log('- Only ONE redirect URI allowed');
console.log('- Must be added as test user');
console.log('- Clear browser cache after changes');

console.log('\n✅ This will fix the "invalid_client" error!');