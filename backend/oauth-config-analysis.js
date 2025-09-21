console.log('🔍 OAuth Configuration Analysis');
console.log('==============================\n');

console.log('📋 Your Current OAuth Configuration:');
console.log('Name: Deep');
console.log('Authorized JavaScript origins: http://localhost:5173');
console.log('Authorized redirect URIs:');
console.log('  1. http://localhost:5000/api/auth/google/callback ✅ CORRECT');
console.log('  2. http://localhost:5173 ❌ WRONG');  
console.log('  3. http://localhost:5173/login ❌ WRONG');
console.log('  4. http://localhost:5173/ ❌ WRONG');
console.log('  5. http://localhost:5001/auth/google/callback ❌ WRONG PORT');
console.log('  6. http://localhost:5000/auth/callback ❌ WRONG PATH\n');

console.log('🚨 PROBLEM IDENTIFIED:');
console.log('======================');
console.log('You have TOO MANY redirect URIs, and most are INCORRECT!');
console.log('Google OAuth is probably confused by multiple URIs.\n');

console.log('✅ SOLUTION: Clean Up Redirect URIs');
console.log('==================================');
console.log('Keep ONLY this redirect URI:');
console.log('  http://localhost:5000/api/auth/google/callback');
console.log('');
console.log('REMOVE all these incorrect ones:');
console.log('  ❌ http://localhost:5173');
console.log('  ❌ http://localhost:5173/login'); 
console.log('  ❌ http://localhost:5173/');
console.log('  ❌ http://localhost:5001/auth/google/callback');
console.log('  ❌ http://localhost:5000/auth/callback\n');

console.log('🔧 STEP-BY-STEP FIX:');
console.log('====================');
console.log('1. Go to Google Cloud Console > Credentials');
console.log('2. Edit your "Deep" OAuth 2.0 client');
console.log('3. In "Authorized redirect URIs" section:');
console.log('   - DELETE all URIs except: http://localhost:5000/api/auth/google/callback');
console.log('   - Keep ONLY that one URI');
console.log('4. Click "Save"');
console.log('5. Wait 2-3 minutes for changes to propagate');
console.log('6. Restart your server\n');

console.log('📝 CORRECT FINAL CONFIGURATION:');
console.log('===============================');
console.log('Authorized JavaScript origins:');
console.log('  ✅ http://localhost:5173 (keep this)');
console.log('');
console.log('Authorized redirect URIs:'); 
console.log('  ✅ http://localhost:5000/api/auth/google/callback (ONLY this one)\n');

console.log('💡 WHY THIS FIXES IT:');
console.log('=====================');
console.log('- Frontend (5173) handles UI');
console.log('- Backend (5000) handles OAuth callback');  
console.log('- Multiple redirect URIs confuse Google OAuth');
console.log('- Wrong URIs cause TokenError: Unauthorized\n');

console.log('🧪 AFTER FIXING - TEST:');
console.log('=======================');
console.log('1. Restart server: node chef-claude-server.js');
console.log('2. Visit: http://localhost:5000/api/auth/google');
console.log('3. Should work without TokenError!\n');

console.log('⚠️  IMPORTANT: Only keep the ONE correct redirect URI!');