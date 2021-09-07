const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: { type: String, required: true, trim: true, min: 2 },
  lastName: { type: String, required: true, trim: true, min: 2 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, min: 2 },
  password: { type: String, required: true, trim: true, min: 6 },
  phone: { type: String, required: true },
  resetPassword: { type: String },
  resetPasswordExpires: { type: Date }
})

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  try {
    const hash = await bcrypt.hash(user.password, 8);
    user.password = hash
    return next()
  } catch (err) {
    return next(err)
  }
})

const User = mongoose.model('User', userSchema);

module.exports = User;