const { Sequelize, DataTypes } = require("sequelize")

module.exports = class MeetMerc extends Sequelize.Model{
    static initialize(sequelize){
        return super.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            stage: {
                type: DataTypes.STRING,
                defaultValue: 'ap',
                allowNull: true
            }
        }, {
            sequelize,
            modelName: 'MeetMerc',
            timestamps: true,
            // underscored: true
        })
    }
}