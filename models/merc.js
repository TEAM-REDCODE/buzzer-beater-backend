const { Sequelize, DataTypes } = require("sequelize")
const User = require('./user')

module.exports = class Merc extends Sequelize.Model{
    static initialize(sequelize){
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
            modelName: 'Merc',
            timestamps: true,  // timestamps 옵션을 추가하여 createdAt 및 updatedAt을 자동으로 관리
            underscored: true,  // underscored 옵션을 추가하여 카멜케이스가 아닌 스네이크케이스로 컬럼 이름을 생성
        })
    }

    static associate(db){
        db.Merc.belongsTo(db.User, {foreignKey: 'UserId', targetKey:'_id'})
        db.Merc.belongsToMany(db.Meet, {
            through: {
                model: db.MeetMerc,
                uniqueKey: '_id'
            }
        })
    }

    static async returnList(page, size, position){
        const { count, rows } = await Merc.findAndCountAll({
            where: {
                position: position
            },
            attributes: ['_id', 'position', 'avTime', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: size,
            offset: (page - 1) * size,
            include: [
                {
                    model: User,
                    attributes: ['nickname', 'height']
                }
            ],
            raw: true
        });

        return { data: rows, total: count }
    }
}