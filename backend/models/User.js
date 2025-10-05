
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  school_id: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'counselor'],
    required: true,
  },
  // Student-specific fields
  dob: {
    type: Date,
    default: null,
  },
  phoneNumber: {
    type: String,
    default: null,
  },
  // Counselor-specific fields
  license: {
    type: String,
    default: null,
  },
  idPicture: {
    type: String, // Assuming this will be a path to the uploaded photo
    default: null,
  },
  licensePicture: {
    type: String, // Assuming this will be a path to the uploaded photo
    default: null,
  },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;
