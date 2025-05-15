const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");
const authRouter = require("./app/routes/TaiKhoan.route");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Ứng dụng quản lý công việc."});
});
// Import routes
app.use("/api/auth", authRouter);

//handle 404
app.use((req, res, next) => {
    //
    return next(new ApiError(404, "Resource not found"));
});

//error handling
app.use((err, req, res, next) => {
    //
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;