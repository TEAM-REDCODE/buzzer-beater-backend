const { sequelize } = require('./models'); // 시퀄라이즈

// 서버 실행시 MYSQL 과 연결
sequelize.sync({ force: false }) // 서버 실행시마다 테이블을 재생성할건지에 대한 여부
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });
