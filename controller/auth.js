const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator')
const User = require('../model/users');
const { createToken, verifyToken } = require('../utils');
const { createNotification } = require('../utils/notification');
exports.signUp = async (req, res) => {
  try {
    const user = await User.create({ ...req.body });
    const token = createToken({ userId: user._id, email: user.email })
    let { password, ...docs } = user._doc;
    res.status(201).json({ user: docs, token });
  } catch (error) {
    res.status(400).json({ error: error.message, msg: "Something went wrong" })
  }
}
exports.signIn = async (req, res) => {
  let { email, password } = req.body
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Email or password incorrect" })
    const isCorrectPassword = await bcrypt.compare(password, user.password)
    if (isCorrectPassword) {
      let { password, ...docs } = user._doc;
      const token = createToken({ userId: user._id, email: user.email })
      return res.status(201).json({ user: docs, token });
    }
    res.status(400).json({ msg: "Email or password incorrect" });
  } catch (error) {
    res.status(400).json({ error: error.message, msg: "Something went wrong" })
  }
}
exports.resetPassword = async (req, res) => {
  let { email } = req.body;
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: error.message, msg: "Something went wrong" })
    }
    // if (user.) {
    //   return res.status(400).json({ error: error.message, msg: "Something went wrong" })
    // }
    const generetedCode = otpGenerator.generate(6, { upperCase: true, specialChars: false })
    const resetPasswordUser = await User.findByIdAndUpdate(user._id, {
      resetPassword: generetedCode,
      resetPasswordExpires: Date.now() + 1000 * 60 * 30
    }, { new: true })
    const sendedMsg = await createNotification(user.phone, generetedCode, "password")
    console.log(resetPasswordUser, sendedMsg, "Sended message")
    res.status(200).json({ msg: "A code has been sent to your phone number. Please enter it to reset your password" });
  } catch (error) {
    res.status(400).json({ error: error.message, msg: "Something went wrong" })
  }
}

exports.checkPasswordRecoveryValidaty = async (req, res) => {
  const { resetPassword, email } = req.body;
  try {
    const user = await User.findOne({ email })
    if (!user || !resetPassword) {
      res.status(404).json({ msg: "email or resetPassword invalid" })
    }
    if (user.resetPassword == resetPassword && user.resetPasswordExpires > Date.now()) {
      const token = createToken({ userId: user._id }, 'password')
      return res.status(200).json({ token, msg: "use the token to set new password, it expires in 15 minutes from you requested to forgot password" });
    }
    res.json({
      success: false,
      msg: "Sorry! Your new password request expired already.",
    });
  } catch (err) {
    res.json({
      success: false,
      msg: "Something went wrong!",
    });

  }
}
exports.setNewPassword = async (req, res) => {

  const token = req.headers.authorization?.split(' ')[1];
  const validToken = token ? verifyToken(token, 'password') : {};
  const { password } = req.body;
  try {
    console.log(validToken, "new password token")
    if (!validToken.userId) {
      return res.status(401).json({
        type: "auth",
        msg: "You are not authorized",
      })
    }
    await User.findByIdAndUpdate(validToken.userId, { password }, { new: true })
    res.status(200).json({ msg: "Your password has been updated successfully" })
  } catch (err) {
    res.status(400).json({ msg: err.message })
  }
};
