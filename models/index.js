const {Sequelize,DataTypes} = require('sequelize')

const sequelize = new Sequelize('coinvista','root','',{
    host:'localhost',
    dialect:'mysql'
})
sequelize.authenticate()
.then(()=>{ console.log(`db connected successfully`)})
.catch((error) => {console.log(error)})

const db = {}
db.sequelize = sequelize
db.Sequelize = Sequelize
db.users = require('./userModels')(sequelize,DataTypes)
db.deposits = require('./depositModel')(sequelize,DataTypes)
db.withdraws = require('./withdrawalModel')(sequelize,DataTypes)
db.notifications = require('./notificationsModel')(sequelize,DataTypes)
db.kycs = require('./kycModel')(sequelize,DataTypes)
db.plans = require('./planModel')(sequelize,DataTypes)

//One to many relationships
db.users.hasMany(db.deposits, {foreignKey: 'user', as:'userdeposits'})
db.users.hasMany(db.withdraws, {foreignKey: 'user', as:'userwithdrawals'})
db.users.hasMany(db.notifications, {foreignKey: 'notify', as:'usernotify'})
db.users.hasMany(db.plans, {foreignKey:'userid', as:'userplans'})
db.users.hasOne(db.kycs, {foreignKey:'userid', as:'userkyc'})

//One to one relationships
db.deposits.belongsTo(db.users, {foreignKey: 'user', as:'userdeposits'})
db.withdraws.belongsTo(db.users, {foreignKey: 'user', as:'userwithdrawals'})
db.notifications.belongsTo(db.users, {foreignKey: 'notify', as: 'usernotify'})
db.plans.belongsTo(db.users, {foreignKey:'userid', as:'userplans'})
db.kycs.belongsTo(db.users, {foreignKey:'userid', as:'userkyc'})

db.sequelize.sync({force: false}).then(() => {console.log('database tables synced successfully')})
module.exports = db