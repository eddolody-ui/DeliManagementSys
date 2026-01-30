import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'Admin' | 'Operation' | 'Finance';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Operation', 'Finance'],
    required: true
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password if not already hashed
UserSchema.pre<IUser>('save', async function() {
  if (!this.isModified('password')) return;
  
  // Check if password is already hashed (starts with '$')
  if (this.password.startsWith('$')) return;
  
  // Hash the password
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
