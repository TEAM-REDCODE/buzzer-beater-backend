const { Sequelize, DataTypes } = require("sequelize")

module.exports = class User extends Sequelize.Model{
    static initialize(sequelize){
        return super.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                comment: "고유번호 UUID"
            },
            nickname: {
                type: DataTypes.STRING(50),
                unique: true,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        args: true,
                        msg: "유효한 이메일 주소를 입력하세요."
                    },
                    isKoreaAcKrDomain(value){
                        if (!value.endsWith('@korea.ac.kr')){
                            throw new Error('It\'s not Korea University email')
                        }
                    }
                },
                comment: "이메일(학교 학생 인증)"
            },
            height: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            mainPosition: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            isMercenary: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                comment: "용병 등록 유무"
            }
        }, {
            sequelize,
            modelName: 'User',
            timestamps: true,  // timestamps 옵션을 추가하여 createdAt 및 updatedAt을 자동으로 관리
            underscored: true,  // underscored 옵션을 추가하여 카멜케이스가 아닌 스네이크케이스로 컬럼 이름을 생성
        });
    }

    static associate(db){
        db.User.belongsToMany(db.Meet, {
            through: {
                model: db.UserMeet,
                uniqueKey: '_id'
            }
        })
        db.User.hasOne(db.Merc, {foreignKey: 'UserId',sourceKey:'_id'});
    }

    static async updateInfoById(filter, update){
        await this.update(
            update ,
            {
                where: {
                    _id: filter
                }
            }
        )
    }

    static async convertIdToNickname(_id) {
        try {
            const user = await this.findOne({
                attributes: ['nickname'],
                where: {
                    _id: _id
                }
            });

            if (user) {
                return user.nickname;
            } else {
                console.log(`User with id ${_id} not found`);
                return null;
            }
        } catch (error) {
            console.error(`Error converting ID to nickname: ${error.message}`);
            throw error;
        }
    }
}