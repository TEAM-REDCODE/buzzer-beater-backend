const { Sequelize, DataTypes } = require("sequelize")

module.exports = class Meet extends Sequelize.Model{
    static initialize(sequelize){
        return super.init({
            _id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                comment: "고유번호"
            },
            title: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            createdById: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            createdByNick: {
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

    static associate(db){
        db.Meet.belongsToMany(db.User, {
            through: {
                model: db.UserMeet,
                uniqueKey: '_id'
            }
        })
    }

    static async returnList(page, size){
        const { count, rows } = await Meet.findAndCountAll({
            attributes: ['_id', 'title', 'createdByNick', 'maxPerson', 'place', 'time'],
            order: [['createdAt', 'DESC']],
            limit: size,
            offset: (page - 1) * size
        });

        return { data: rows, total: count }
    }

    static async updateMeetInfo(filter, update) {
        await Meet.update(
            update,
            {
                where: {
                    _id: filter
                }
            }
        )
    }
}