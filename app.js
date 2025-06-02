const express = require("express");
const cors = require("cors");
const path = require("path");
const ApiError = require("./app/api-error");
const authRouter = require("./app/routes/TaiKhoan.route");
const departmentRouter = require("./app/routes/PhongBan.route");
const projectRouter = require("./app/routes/DuAn.route");
const taskRouter = require("./app/routes/CongViec.route");
const assignmentRouter = require("./app/routes/PhanCong.route");
const notificationRouter = require("./app/routes/ThongBao.route");
const fileRouter = require("./app/routes/File.route");
const taskGroupRouter = require("./app/routes/NhomCongViec.route");
const calendarRouter = require("./app/routes/LichNghi.route")

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
    res.json({ message: "Ứng dụng quản lý công việc."});
});
// Import routes
app.use("/api/auth", authRouter);
app.use("/api/phongban", departmentRouter);
app.use("/api/duan", projectRouter);
app.use("/api/congviec", taskRouter);
app.use("/api/phancong", assignmentRouter);
app.use("/api/thongbao", notificationRouter);
app.use("/api/file", fileRouter);
app.use("/api/nhomviec", taskGroupRouter);
app.use("/api/lich", calendarRouter)

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