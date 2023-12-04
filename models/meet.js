const { Sequelize, DataTypes } = require("sequelize")

module.exports = class Meet extends Sequelize.Model{
    static initiate(sequelize){
        return super.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                comment: "고유번호 UUID"
            },
            title: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            createdBy: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            maxPerson: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            place: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            time: {
                type: DataTypes.DATE,
                allowNull: false,
            }
        }, {
            sequelize,
            modelName: 'Meet',
            timestamps: true,  // timestamps 옵션을 추가하여 createdAt 및 updatedAt을 자동으로 관리
            underscored: true,  // underscored 옵션을 추가하여 카멜케이스가 아닌 스네이크케이스로 컬럼 이름을 생성
        });
    }
    // todo: add associate options
}