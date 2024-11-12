const sendMail = require('../emailConfig/emailConfig')
const otpgenerator = require('otp-generator')
const jwt = require('jsonwebtoken')
var slug = require('slug')
const User = require('../models').users
const Deposit = require('../models').deposits
const Withdrawal = require('../models').withdraws
const KYC = require('../models').kycs
const Notify = require('../models').notifications
const fs = require(`fs`)
const Plan = require('../models').plans


exports.GetAllusers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Deposit, as: 'userdeposits',
        },
        {
          model: Withdrawal, as: 'userwithdrawals',
        },
      ]
    })
    return res.json({ status: 200, msg: 'Users fetched successfully', data: users })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}


exports.CreateAccount = async (req, res) => {
  try { 
    const { firstname, lastname, email, username, country, password, confirm_password, phone } = req.body
    if (!firstname || !lastname || !email || !username || !country || !password  || !phone ) {
      return res.json({ status: 404, msg: 'Incomplete Request' })
    }
    const CheckPhone = await User.findOne({ where: { phone: phone } })
    if (CheckPhone) return res.json({ status: 404, msg: 'Phone number already exists with us' })
    const CheckUsername = await User.findOne({ where: { username: username } })
    if (CheckUsername) return res.json({ status: 404, msg: 'Username already exists with us' })
    const CheckEmail = await User.findOne({ where: { email: email } })
    if (CheckEmail) return res.json({ status: 404, msg: 'Email already exists with us' })
    if (password.length <= 4) return res.json({ status: 404, msg: 'Password must be greater than 5 characters' })
    if (confirm_password !== password) return res.json({ status: 404, msg: 'Password(s) mismatched' })

    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
      username,
      phone,
      country
    })
    const otp = otpgenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    const content = `<div>
      <p>hi dear, please verify your email with the code below</p>
      <div style="  padding: 1rem; background-color: red; width: 100%; dislpay:flex; align-items: center;
      justify-content: center;">
      <h3 style="font-size: 1.5rem">${otp}</h3>
      </div>
      </div>`
    await Notify.create({
      type: 'Successful Sign Up',
      message: `Hi ${username}, Welcome to Coinvista, you're one step away from stepping into your financial freedom. Take the bold steps and complete kyc verifications. head over to our help page if you need any, Thank You. `,
      status: 'unread',
      notify: user.id
    })
    user.reset_code = otp
    await user.save()
    await sendMail({ from: 'myonlineemail@gmail.com', to: email, subject: 'Email Verification', html: content })
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })
    return res.json({ status: 200, msg: 'Account Created Succcessfully', token,user })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}

exports.LoginAcc = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.json({ status: 404, msg: "Username or password missing" })
    let user = await User.findOne({ where: { email } })
    if (!user) return res.json({ status: 400, msg: 'Invalid account' })
    if (user.password !== password) return res.json({ status: 404, msg: 'Invalid password' })
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '9h' })
    user.status = 'online'
    return res.json({ status: 200, msg: 'Login successful', token })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}

exports.GetUserProfile = async (req, res) => {
  try {
    const ExcludeNames = ['password', 'role', 'reset_code']
    const user = await User.findOne({
      where: { id: req.user },
      attributes: { exclude: ExcludeNames }
    })
    if (!user) return res.json({ status: 400, msg: 'Incomplete request' })
    return res.json({ status: 200, msg: 'Profile fetched successfully', data: user })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })

  }
}

exports.logOutUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user)
    if (!user) return res.json({
      status: 404,
      msg: `Account not found`,
    })
    user.status = 'offline'
    await user.save()
    return res.json({ status: 200, msg: `Logged out successfully ` })

  } catch (error) {
    return res.json({ status: 404, msg: error })
  }
}



exports.ChangeProfileImage = async (req, res) => {
  try {
    const { email, username } = req.body
    if (!email || !username) return res.json({ status: 404, msg: 'Incomplete request' })
    if (!req.files) return res.json({ status: 404, msg: 'profile image is required' })
    const findProfile = await User.findOne({ where: { email } })
    const image = req?.files?.image  // null or undefined
    let imageName;
    const filePath = './public/profiles'
    const currentImagePath = `${filePath}/${findProfile.image}`
    if (image) {
      // Check image size and format
      if (image.size >= 1000000) return res.json({ status: 400, msg: `Cannot upload up to 1MB` })
      if (!image.mimetype.startsWith('image/')) return res.json({ status: 400, msg: `Invalid image format (jpg, jpeg, png, svg, gif, webp)` })

      // Check for the existence of the current image path and delete it
      if (fs.existsSync(currentImagePath)) {
        fs.unlinkSync(currentImagePath)
      }

      // Check for the existence of the blog image path
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath)
      }
      imageName = `${slug(username, '-')}.png`
      findProfile.image = imageName
      await image.mv(`${filePath}/${imageName}`)
    }
    await findProfile.save()
    return res.json({ status: 200, msg: 'profile image uploaded successfully' })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}

exports.VerifyEmail = async (req, res) => {

  try {
    const { reset_code, email } = req.body
    if (!reset_code || !email) return res.json({ status: 404, msg: 'Incomplete Request' })
    const FindEmail = await User.findOne({ where: { email: email } })
    if (!FindEmail) return res.json({ status: 404, msg: 'Account not found' })
    if (reset_code !== FindEmail.reset_code) return res.json({ status: 404, msg: 'Invalid code' })
    FindEmail.reset_code = null
    FindEmail.email_verified = 'true'
    await FindEmail.save()
    return res.json({ status: 200, msg: 'Email verified successfully' })

  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}

exports.ResendOtp = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.json({ status: 404, msg: 'Email is required' })
    const findEmail = await User.findOne({ where: { email } })
    if (!findEmail) return res.json({ status: 404, msg: 'Invalid Account' })
    const otp = otpgenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    const content = `<div>
    <p>hi dear, please verify your email with the code below</p>
    <div style="  padding: 1rem; background-color: red; width: 100%; dislpay:flex; align-items: center;
    justify-content: center;">
    <h3 style="font-size: 1.5rem">${otp}</h3>
    </div>
    </div>`
    findEmail.reset_code = otp
    await findEmail.save()
    await sendMail({ from: 'myonlineemail@gmail.com', to: email, subject: 'Email Verification', html: content })
    res.json({ status: 200, msg: 'OTP resent successfuly' })
  } catch (error) {
    return res.json({ status: 500, msg: error.message })
  }
}