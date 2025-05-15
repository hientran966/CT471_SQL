const mysql = require('mysql2/promise');

class MySQL {
    static async connect(config) {
        if (this.connection) return this.connection;
        this.connection = await mysql.createConnection(config);
        return this.connection;
    }
}

module.exports = MySQL;