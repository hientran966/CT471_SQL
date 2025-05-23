const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const TaskGroupService = require("../services/NhomCongViec.service");

//Tao nhóm công việc
exports.create = async (req, res, next) => {
    if (!req.body.tenNhom) {
        return next(new ApiError(400, "Tên nhóm công việc không được để trống"));
    }

    try {
        const taskGroupService = new TaskGroupService(MySQL.pool);
        const document = await taskGroupService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo nhóm công việc")
        );
    }
};

//Lấy tất cả nhóm công việc
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const taskGroupService = new TaskGroupService(MySQL.connection);
        //Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const {tenNhom, idDuAn, idNguoiTao} = req.query;
        if (tenNhom || idDuAn || idNguoiTao) {
            documents = await taskGroupService.find({
                tenNhom,
                idDuAn,
                idNguoiTao,
            });
        } else {
            documents = await taskGroupService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách nhóm công việc")
        );
    }

    return res.send(documents);
};

//Lấy nhóm công việc theo id
exports.findOne = async (req, res, next) => {
    try {
        const taskGroupService = new TaskGroupService(MySQL.connection);
        const document = await taskGroupService.findById(req.params.id);
        if (!document){
            return next(new ApiError(404, "Nhóm công việc không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi lấy nhóm công việc với id=${req.params.id}`
            )
        );
    }
};

//Cập nhật nhóm công việc
exports.update = async (req, res, next) => {
    if (!req.body.tenNhom) {
        return next(new ApiError(400, "Tên nhóm công việc không được để trống"));
    }

    try {
        const taskGroupService = new TaskGroupService(MySQL.connection);
        const document = await taskGroupService.update(req.params.id, req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi cập nhật nhóm công việc")
        );
    }
};

//Xóa nhóm công việc
exports.delete = async (req, res, next) => {
    try {
        const taskGroupService = new TaskGroupService(MySQL.connection);
        await taskGroupService.delete(req.params.id);
        return res.send({ message: "Xóa nhóm công việc thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa nhóm công việc")
        );
    }
};

//Khôi phục nhóm công việc
exports.restore = async (req, res, next) => {
    try {
        const taskGroupService = new TaskGroupService(MySQL.connection);
        await taskGroupService.restore(req.params.id);
        return res.send({ message: "Khôi phục nhóm công việc thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi khôi phục nhóm công việc")
        );
    }
};

//Xóa tất cả nhóm công việc
exports.deleteAll = async (req, res, next) => {
    try {
        const taskGroupService = new TaskGroupService(MySQL.connection);
        await taskGroupService.deleteAll();
        return res.send({ message: "Xóa tất cả nhóm công việc thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả nhóm công việc")
        );
    }
};
