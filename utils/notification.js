const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const Url = require('url-parse')

const httpPost = rateLimit(axios.create(), {
  maxRequests: 4,
  perMilliseconds: 1000,
});

exports.createNotification = async (phone, message, type) => {
  try {
    let sms;
    if (type === 'password') {
      sms = `Telefon raqamingizga kod yuborildi. Parolni tiklash uchun uni kiriting
      Parol: ${message}  
      `
    }
    if (type === 'order') {
      message = "sizning buyurtmangiz qabul qilindi"
    }
    if (type === 'status') {
      message = "sizning buyurtmangiz qabul qilindi"
    }
    console.log(sms, "sms message");
    const smsUrl = new Url(
      `https://semysms.net/api/3/sms.php?token=${process.env.SMS_TOKEN}&device=${process.env.DEVICE_ID}&phone=${"%2B" + phone}&msg=${sms}`,
      true
    ).href;
    const { data } = await httpPost.post(smsUrl)
    return {
      success: true,
      message,
      data
    }
  } catch (err) {
    return {
      success: false,
      err: err.message
    }
  }
}
