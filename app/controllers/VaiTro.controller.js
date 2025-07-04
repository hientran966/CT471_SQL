const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const RoleService = require("../services/VaiTro.service");

// Tạo vai trò
exports.create = async (req, res, next) => {
    if (!req.body.tenVaiTro) {
        return next(new ApiError(400, "Tên vai trò không được để trống"));
    }

    try {
        const roleService = new RoleService(MySQL.pool);
        const document = await roleService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi tạo vai trò"));
    }
}

// Lấy tất cả vai trò
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const roleService = new RoleService(MySQL.connection);
        // Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const { tenVaiTro, phanQuyen } = req.query;
        if (tenVaiTro || phanQuyen) {
            documents = await roleService.find({ tenVaiTro, phanQuyen });
        } else {
            documents = await roleService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách vai trò"));
    }

    return res.send(documents);
}

// Lấy vai trò theo id
exports.findOne = async (req, res, next) => {
    try {
        const roleService = new RoleService(MySQL.connection);
        const document = await roleService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Vai trò không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy vai trò"));
    }
}

// Cập nhật vai trò
exports.update = async (req, res, next) => {
    if (!req.body.tenVaiTro) {
        return next(new ApiError(400, "Tên vai trò không được để trống"));
    }

    try {
        const roleService = new RoleService(MySQL.connection);
        const document = await roleService.update(req.params.id, req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi cập nhật vai trò"));
    }
}

// Xóa vai trò
exports.delete = async (req, res, next) => {
    try {
        const roleService = new RoleService(MySQL.pool);
        await roleService.delete(req.params.id);
        return res.send({ message: "Xóa vai trò thành công" });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa vai trò"));
    }
}

// Xóa tất cả vai trò
exports.deleteAll = async (req, res, next) => {
    try {
        const roleService = new RoleService(MySQL.connection);
        await roleService.deleteAll();
        return res.send({ message: "Xóa tất cả vai trò thành công" });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả vai trò"));
    }
}

// Khôi phục vai trò đã xóa
exports.restore = async (req, res, next) => {
    try {
        const roleService = new RoleService(MySQL.connection);
        await roleService.restore(req.params.id);
        return res.send({ message: "Khôi phục vai trò thành công" });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi khôi phục vai trò"));
    }
}