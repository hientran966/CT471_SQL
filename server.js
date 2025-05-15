const app = require("./app");
const config = require("./app/config");
const MySQL = require("./app/utils/mysql.util");

async function startServer() {
    try {
        await MySQL.connect({
            host: config.db.host,
            user: config.db.username,
            password: config.db.password,
            database: config.db.database
        });
        console.log("Connected to the database!");

        const PORT = config.app.port;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log("Cannot connect to the database!", error);
        process.exit();
    }
}

startServer();