import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../server/src/models/User';
import { connectDB } from '../server/src/config/db';
console.log('User model is:', User);

const users = [
  { username: 'admin', password: 'admin123', role: 'Admin' },
  { username: 'operation', password: 'op123', role: 'Operation' },
  { username: 'finance', password: 'fin123', role: 'Finance' }
];
console.log('User model:', User);

async function seedUsers() {
  try {
    await connectDB();

    for (const userData of users) {
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        console.log(`User ${userData.username} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = new User({
        username: userData.username,
        password: hashedPassword,
        role: userData.role
      });

      await user.save();
      console.log(`Created user: ${userData.username} (${userData.role})`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedUsers();
