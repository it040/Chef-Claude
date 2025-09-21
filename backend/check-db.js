const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

console.log('📊 Checking MongoDB for existing users...\n');

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('✅ MongoDB connected');
  
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    console.log(`\n📈 Database Statistics:`);
    console.log(`   Total Users: ${users.length}`);
    console.log(`   OAuth Users: ${users.filter(u => u.googleId).length}`);
    console.log(`   Regular Users: ${users.filter(u => !u.googleId).length}`);
    
    if (users.length === 0) {
      console.log('\n📝 No users found in database.');
      console.log('   This is expected if this is the first time running OAuth.');
    } else {
      console.log(`\n👥 Users in Database:`);
      users.forEach((user, index) => {
        console.log(`\n   ${index + 1}. ${user.name}`);
        console.log(`      📧 Email: ${user.email}`);
        console.log(`      🆔 MongoDB ID: ${user._id}`);
        console.log(`      🔑 Google ID: ${user.googleId || 'None (regular signup)'}`);
        console.log(`      📅 Created: ${user.createdAt.toLocaleDateString()}`);
        console.log(`      🕒 Last Login: ${user.lastLogin.toLocaleDateString()}`);
        console.log(`      📸 Avatar: ${user.avatar ? 'Yes' : 'No'}`);
        console.log(`      📚 Saved Recipes: ${user.savedRecipes.length}`);
        console.log(`      ❤️ Favorites: ${user.favorites.length}`);
      });
    }
    
    console.log(`\n✅ Database check completed!`);
  } catch (error) {
    console.error('❌ Database query error:', error.message);
  }
  
  mongoose.connection.close();
  process.exit(0);
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});