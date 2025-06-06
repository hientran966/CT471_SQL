const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const ProjectService = require("../services/DuAn.service");

//Tạo dự án
exports.create = async (req, res, next) => {
    const ngayBD = new Date(req.body.ngayBD);
    const ngayKT = new Date(req.body.ngayKT);

    if (!req.body.tenDA) {
        return next(new ApiError(400, "Tên dự án không được để trống"));
    }
    if (ngayKT < ngayBD) {
        return next(new ApiError(400, "Ngày kết thúc không hợp lệ"));
    }

    try {
        const projectService = new ProjectService(MySQL.pool);
        const document = await projectService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo dự án")
        );
    }
};

//Lấy tất cả dự án
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const projectService = new ProjectService(MySQL.connection);
        //Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const {tenDA, trangThai, idNguoiTao, ngayBD, ngayKT} = req.query;
        if (tenDA || trangThai || idNguoiTao || ngayBD || ngayKT) {
            documents = await projectService.find({
                tenDA,
                trangThai,
                idNguoiTao,
                ngayBD,
                ngayKT
            });
        } else {
            documents = await projectService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách dự án")
        );
    }

    return res.send(documents);
};

//Lấy dự án theo id
exports.findOne = async (req, res, next) => {
    try {
        const projectService = new ProjectService(MySQL.connection);
        const document = await projectService.findById(req.params.id);
        if (!document){
            return next(new ApiError(404, "Dự án không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi lấy dự án với id=${req.params.id}`
            )
        );
    }
};

//Cập nhật dự án
exports.update = async (req, res, next) => {
    try {
        const projectService = new ProjectService(MySQL.connection);
        const document = await projectService.update(req.params.id, req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi cập nhật dự án")
        );
    }
};

//Xóa dự án
exports.delete = async (req, res, next) => {
    try {
        const projectService = new ProjectService(MySQL.connection);
        await projectService.delete(req.params.id);
        return res.send({ message: "Xóa dự án thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa dự án")
        );
    }
};

//Khôi phục dự án
exports.restore = async (req, res, next) => {
    try {
        const projectService = new ProjectService(MySQL.connection);
        await projectService.restore(req.params.id);
        return res.send({ message: "Khôi phục dự án thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi khôi phục dự án")
        );
    }
};

//Xóa tất cả dự án
exports.deleteAll = async (req, res, next) => {
    try {
        const projectService = new ProjectService(MySQL.connection);
        await projectService.deleteAll();
        return res.send({ message: "Xóa tất cả dự án thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả dự án")
        );
    }
};

//Lấy các dự án được phân công theo tài khoản
exports.findByAccountId = async (req, res, next) => {
    try {
        const projectService = new ProjectService(MySQL.connection);
        const documents = await projectService.findByAccountId(req.params.id);
        return res.send(documents);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi lấy dự án theo idNguoiNhan=${req.params.id}`
            )
        );
    }
};
