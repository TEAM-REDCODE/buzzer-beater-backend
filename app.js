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

process.on('uncaughtException', (err) => {
    console.error('처리되지 않은 오류 발생', err);
    process.exit(1); // Node.js 문서에 따라 필수
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('처리되지 않은 거부:', promise, '이유:', reason);
    // 애플리케이션 특정 로깅, 오류 발생, 또는 기타 로직
});