const { Sequelize, DataTypes} = require("sequelize")

module.exports = class Jwt extends Sequelize.Model{
    static initiate(sequelize){
        return super.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                comment: "고유번호 UUID"
            },
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            refreshToken: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        }, {
            sequelize,
            modelName: 'Jwt',
            timestamps: true,  // timestamps 옵션을 추가하여 createdAt 및 updatedAt을 자동으로 관리
            underscored: true,  // underscored 옵션을 추가하여 카멜케이스가 아닌 스네이크케이스로 컬럼 이름을 생성
        })
    }

    static async findToken(user_id){
        return await this.findOne({
            where: {
                user_id: user_id
            }
        })
    }

    static updateRefresh = async ({user_id, refreshToken}) => {
        try {
            const updatedJwt = await this.update(
                { refreshToken: refreshToken }, // 업데이트할 필드 및 값
                {
                    where: {
                        user_id: user_id,
                    },
                }
            );
            if (updatedJwt[0] === 1) {
                console.log('Update successful');
            } else {
                console.log('User not found or update failed');
            }
        } catch (error) {
            console.error(error);
        }
    }
}