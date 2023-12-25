const { Sequelize, DataTypes } = require("sequelize")

module.exports = class MeetMerc extends Sequelize.Model{
    static initialize(sequelize){
        return super.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            }
        }, {
            sequelize,
            modelName: 'MeetMerc',
            timestamps: false,
            // underscored: true
        })
    }
}