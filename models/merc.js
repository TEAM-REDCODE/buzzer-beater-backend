const { Sequelize, DataTypes } = require("sequelize")

module.exports = class Merc extends Sequelize.Model{
    static initiate(sequelize){
        return super.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                comment: "고유번호 UUID"
            },
            position: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            avTime: {
                type: DataTypes.DATE,
                allowNull: false
            }
        }, {
            sequelize,
            modelName: 'Mercs',
            timestamps: true,  // timestamps 옵션을 추가하여 createdAt 및 updatedAt을 자동으로 관리
            underscored: true,  // underscored 옵션을 추가하여 카멜케이스가 아닌 스네이크케이스로 컬럼 이름을 생성
        })
    }
    // todo: add associate options
}