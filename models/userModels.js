module.exports = (sequelize,DataTypes)=>{
    return sequelize.define('user',{
     firstname:{type:DataTypes.STRING,allowNull:false},
     lastname:{type:DataTypes.STRING,allowNull:false},
     username:{type:DataTypes.STRING,allowNull:false},
     email: {type :DataTypes.STRING, allowNull: false},
     phone: {type :DataTypes.STRING, allowNull: false},
     country: {type :DataTypes.STRING, allowNull: false},
     password: {type :DataTypes.STRING, allowNull: false},
     image:{type:DataTypes.STRING, allowNull:true},
     reset_code:{type:DataTypes.STRING, allowNull:true},
     kyc_status:{type:DataTypes.STRING, allowNull:true,defaultValue:'unverified'},
     email_verified:{type:DataTypes.STRING, allowNull:true, defaultValue: 'false'},
     role:{type:DataTypes.STRING, allowNull:false, defaultValue:'user'},
     status:{type:DataTypes.STRING, allowNull:true, defaultValue: 'offline'},
    })
}