const jwt = require('jsonwebtoken');
const User = require('../model/users');
exports.createToken = (data, type = "default") => {
  if (type == "password") {
    return jwt.sign(data, process.env.JWT_PASSWORD_SECRET_KEY, { expiresIn: '15m' });
  }
  return jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: '10h' });
}

exports.verifyToken = (token, type = "default") => {
  try {
    if (type == "password") {
      return jwt.verify(token, process.env.JWT_PASSWORD_SECRET_KEY)
    }
    return jwt.verify(token, process.env.JWT_SECRET_KEY)

  } catch (error) {
    return {}
  }
}

exports.authHandler = async (req, res, next) => {
  const whiteList = ['/api/auth/sign-in', '/api/auth/sign-up', '/api/auth/recover-password', '/api/auth/recover-password/check', '/api/auth/recover-password/new-password']
  const token = req.headers.authorization?.split(' ')[1];
  const validToken = token ? this.verifyToken(token) : {};
  console.log(req.url, whiteList.includes(req.url), validToken, "req url")
  try {
    if (whiteList.includes(req.url)) return next()
    if (!validToken.userId) {
      return res.status(401).json({
        type: "auth",
        msg: "You need to login/sign up first",
      })
    }
    const user = await User.findById(validToken.userId);
    if (!user) {
      return res.status(403).json({ msg: 'You are not authorized' });
    }
    req.locals = { ...req.locals, userId: validToken.userId }
    next();
  } catch (err) {
    res.status(401).json({
      type: "auth",
      msg: "You need to login/sign up first"
    })
  }
}