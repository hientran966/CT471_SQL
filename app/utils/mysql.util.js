const mysql = require('mysql2/promise');
const config = require('../config');

class MySQL {
    static async connect(config) {
        if (this.connection) return this.connection;
        this.connection = await mysql.createConnection(config);
        return this.connection;
    }

    static pool = mysql.createPool({
        host: config.db.host,
        port: config.db.port,
        user: config.db.username,
        password: config.db.password,
        database: config.db.database,
    });
}

module.exports = MySQL;