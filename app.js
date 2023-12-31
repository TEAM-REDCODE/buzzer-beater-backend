const API = require('./api');
const { sequelize } = require('./models');

(async () => {
    // 서버 실행시 MYSQL과 연결
    sequelize.sync({ force: false }) // 서버 실행시마다 테이블을 재생성할건지에 대한 여부
        .then(() => {
            console.log('데이터베이스 연결 성공');

            const api = new API();
            api.listen();
        })
        .catch((err) => {
            console.error(err);
        });
})();