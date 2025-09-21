const fs = require('fs');
const path = require('path');

console.log('📝 Updating .env file for new OAuth credentials');
console.log('===============================================\n');

const envPath = path.join(__dirname, '.env');
const backupPath = path.join(__dirname, '.env.backup');

try {
  // Backup current .env
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, backupPath);
    console.log('✅ Created backup: .env.backup');
  }

  // Read current .env
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update OAuth credentials with placeholder
  envContent = envContent.replace(/GOOGLE_CLIENT_ID=.*/, 'GOOGLE_CLIENT_ID=your-new-client-id-here');
  envContent = envContent.replace(/GOOGLE_CLIENT_SECRET=.*/, 'GOOGLE_CLIENT_SECRET=your-new-client-secret-here');
  
  // Ensure callback URL is correct
  if (!envContent.includes('GOOGLE_CALLBACK_URL')) {
    envContent += '\nGOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback';
  } else {
    envContent = envContent.replace(/GOOGLE_CALLBACK_URL=.*/, 'GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback');
  }

  // Write updated .env
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env file with placeholders');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('1. Follow the OAuth setup guide: node create-new-oauth.js');
  console.log('2. Replace placeholders in .env with real credentials');
  console.log('3. OR use development bypass: http://localhost:5000/api/auth/dev-login');
  console.log('');
  console.log('💡 Development bypass allows testing without OAuth');

} catch (error) {
  console.error('❌ Error updating .env:', error.message);
}