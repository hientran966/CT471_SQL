const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const TaskService = require("../services/CongViec.service");

//Tao công việc
exports.create = async (req, res, next) => {
    if (!req.body.tenCV) {
        return next(new ApiError(400, "Tên công việc không được để trống"));
    }

    try {
        const taskService = new TaskService(MySQL.connection);
        const document = await taskService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo công việc")
        );
    }
};

//Lấy tất cả công việc
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const taskService = new TaskService(MySQL.connection);
        //Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const {tenCV, trangThai, duAn, ngayBD, ngayKT} = req.query;
        if (tenCV || trangThai || duAn || ngayBD || ngayKT) {
            documents = await taskService.find({
                tenCV,
                trangThai,
                duAn,
                ngayBD,
                ngayKT
            });
        } else {
            documents = await taskService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách công việc")
        );
    }

    return res.send(documents);
};

//Lấy công việc theo id
exports.findOne = async (req, res, next) => {
    try {
        const taskService = new TaskService(MySQL.connection);
        const document = await taskService.findById(req.params.id);
        if (!document){
            return next(new ApiError(404, "Công việc không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi lấy công việc với id=${req.params.id}`
            )
        );
    }
};

//Cập nhật công việc
exports.update = async (req, res, next) => {
    if (!req.body.tenCV) {
        return next(new ApiError(400, "Tên công việc không được để trống"));
    }

    try {
        const taskService = new TaskService(MySQL.connection);
        const document = await taskService.update(req.params.id, req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi cập nhật công việc")
        );
    }
};

//Xóa công việc
exports.delete = async (req, res, next) => {
    try {
        const taskService = new TaskService(MySQL.connection);
        const document = await taskService.delete(req.params.id);
        return res.send({ message: "Xóa thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa công việc")
        );
    }
};

//Xóa tất cả công việc
exports.deleteAll = async (req, res, next) => {
    try {
        const taskService = new TaskService(MySQL.connection);
        const document = await taskService.deleteAll();
        return res.send({ message: "Xóa tất cả công việc thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả công việc")
        );
    }
};
