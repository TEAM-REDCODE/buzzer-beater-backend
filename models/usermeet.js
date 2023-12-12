const { Sequelize, DataTypes } = require("sequelize")

module.exports = class UserMeet extends Sequelize.Model{
    static initialize(sequelize){
        return super.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            }
        }, {
            sequelize,
            modelName: 'UserMeet',
            timestamps: false,
            // underscored: true
        })
    }
}