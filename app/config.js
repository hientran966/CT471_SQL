require('dotenv').config();

module.exports = {
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    },
    app: {
        port: process.env.PORT || 3000,
    }
};