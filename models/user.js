const { Sequelize, DataTypes } = require("sequelize")

module.exports = class User extends Sequelize.Model{
    static initiate(sequelize){
        return super.init({
            _id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                comment: "고유번호 UUID"
            },
            nickname: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false,
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
    // todo: add associate options
}