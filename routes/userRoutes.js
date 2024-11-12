const { GetAllusers, LoginAcc, CreateAccount, GetUserProfile, logOutUser, ChangeProfileImage, VerifyEmail, ResendOtp } = require('../controllers/userControllers')
const { userMiddleware } = require('../middleware/auth')


const router = require('express').Router()

router.get('/getAll', GetAllusers)
router.post('/create', CreateAccount)
router.post('/login', LoginAcc)
router.post('/logout',userMiddleware,logOutUser)
router.get('/profile', userMiddleware,GetUserProfile)
router.post('/upload-img',userMiddleware,ChangeProfileImage)
router.post('/verify-email',VerifyEmail)
router.post('/resend-otp',ResendOtp)
module.exports = router