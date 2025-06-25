const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const DepartmentService = require("../services/PhongBan.service");

//Tạo phòng ban
exports.create = async (req, res, next) => {
    if (!req.body.tenPhong) {
        return next(new ApiError(400, "Tên phòng ban không được để trống"));
    }

    try {
        const departmentService = new DepartmentService(MySQL.pool);
        const document = await departmentService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo phòng ban")
        );
    }
};

//Lấy tất cả phòng ban
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const departmentService = new DepartmentService(MySQL.connection);
        //Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const {tenPhong} = req.query;
        if (tenPhong) {
            documents = await departmentService.findByName(tenPhong);
        } else {
            documents = await departmentService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách phòng ban")
        );
    }

    return res.send(documents);
};

//Lấy phòng ban theo id
exports.findOne = async (req, res, next) => {
    try {
        const departmentService = new DepartmentService(MySQL.connection);
        const document = await departmentService.findById(req.params.id);
        if (!document){
            return next(new ApiError(404, "Phòng ban không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi lấy phòng ban với id=${req.params.id}`
            )
        );
    }
};

//Cập nhật phòng ban
exports.update = async (req, res, next) => {
    if (!req.body.tenPhong) {
        return next(new ApiError(400, "Tên phòng ban không được để trống"));
    }

    try {
        const departmentService = new DepartmentService(MySQL.connection);
        await departmentService.update(req.params.id, req.body);
        return res.send({ message: "Cập nhật thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi cập nhật phòng ban với id=${req.params.id}`
            )
        );
    }
};

//Xóa phòng ban
exports.delete = async (req, res, next) => {
    try {
        const departmentService = new DepartmentService(MySQL.connection);
        await departmentService.delete(req.params.id);
        return res.send({ message: "Xóa thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi xóa phòng ban với id=${req.params.id}`
            )
        );
    }
};

//Khôi phục phòng ban
exports.restore = async (req, res, next) => {
    try {
        const departmentService = new DepartmentService(MySQL.connection);
        await departmentService.restore(req.params.id);
        return res.send({ message: "Khôi phục thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi khôi phục phòng ban với id=${req.params.id}`
            )
        );
    }
};

//Xóa tất cả phòng ban
exports.deleteAll = async (req, res, next) => {
    try {
        const departmentService = new DepartmentService(MySQL.connection);
        await departmentService.deleteAll();
        return res.send({ message: "Xóa tất cả phòng ban thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả phòng ban")
        );
    }
};

// Lấy phân quyền
exports.getRole = async (req, res, next) => {
    try {
        const departmentService = new DepartmentService(MySQL.connection);
        const permissions = await departmentService.getRole(req.params.id);
        return res.send(permissions);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi lấy phân quyền phòng ban với id=${req.params.id}`
            )
        );
    }
};