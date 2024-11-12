module.exports = (sequelize, DataTypes) => {
    return sequelize.define('withdraw', {
        amount: { type: DataTypes.INTEGER, allowNull: false },
        status:{type: DataTypes.STRING, allowNull:false, defaultValue:'pending'},
        type:{type: DataTypes.STRING, allowNull:false, defaultValue:'withdrawal'},
        cur_bal:{type: DataTypes.INTEGER, allowNull:false},
        message:{type: DataTypes.STRING, allowNull:false},
        wallet:{type: DataTypes.STRING, allowNull:true},
        address:{type: DataTypes.STRING, allowNull:true},
        transaction_id:{type: DataTypes.STRING, allowNull:true}
    })
}