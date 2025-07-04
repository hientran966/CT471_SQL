const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const DeptRoleService = require("../services/LoaiPhongBan.service");

// Tạo loại phòng ban
exports.create = async (req, res, next) => {
    if (!req.body.loaiPhongBan) {
        return next(new ApiError(400, "Tên loại phòng ban không được để trống"));
    }

    try {
        const deptRoleService = new DeptRoleService(MySQL.pool);
        const document = await deptRoleService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi tạo loại phòng ban"));
    }
}

// Lấy tất cả loại phòng ban
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const deptRoleService = new DeptRoleService(MySQL.connection);
        // Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const { loaiPhongBan } = req.query;
        if (loaiPhongBan) {
            documents = await deptRoleService.find({ loaiPhongBan });
        } else {
            documents = await deptRoleService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách loại phòng ban"));
    }

    return res.send(documents);
}

// Lấy loại phòng ban theo id
exports.findOne = async (req, res, next) => {
    try {
        const deptRoleService = new DeptRoleService(MySQL.connection);
        const document = await deptRoleService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Loại phòng ban không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy loại phòng ban"));
    }
}

// Cập nhật loại phòng ban
exports.update = async (req, res, next) => {
    if (!req.body.loaiPhongBan) {
        return next(new ApiError(400, "Tên loại phòng ban không được để trống"));
    }

    try {
        const deptRoleService = new DeptRoleService(MySQL.connection);
        const updated = await deptRoleService.update(req.params.id, req.body);
        if (!updated) {
            return next(new ApiError(404, "Loại phòng ban không tồn tại hoặc không có thay đổi nào"));
        }
        return res.send({ message: "Cập nhật loại phòng ban thành công" });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi cập nhật loại phòng ban"));
    }
}

// Xóa loại phòng ban
exports.delete = async (req, res, next) => {
    try {
        const deptRoleService = new DeptRoleService(MySQL.pool);
        const deleted = await deptRoleService.delete(req.params.id);
        if (!deleted) {
            return next(new ApiError(404, "Loại phòng ban không tồn tại"));
        }
        return res.send({ message: "Xóa loại phòng ban thành công" });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa loại phòng ban"));
    }
}

// Xóa tất cả loại phòng ban
exports.deleteAll = async (req, res, next) => {
    try {
        const deptRoleService = new DeptRoleService(MySQL.connection);
        const deleted = await deptRoleService.deleteAll();
        if (!deleted) {
            return next(new ApiError(404, "Không có loại phòng ban nào để xóa"));
        }
        return res.send({ message: "Xóa tất cả loại phòng ban thành công" });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả loại phòng ban"));
    }
}

// Khôi phục loại phòng ban đã xóa
exports.restore = async (req, res, next) => {
    try {
        const deptRoleService = new DeptRoleService(MySQL.connection);
        const restored = await deptRoleService.restore(req.params.id);
        if (!restored) {
            return next(new ApiError(404, "Loại phòng ban không tồn tại hoặc đã được khôi phục"));
        }
        return res.send({ message: "Khôi phục loại phòng ban thành công" });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi khôi phục loại phòng ban"));
    }
}