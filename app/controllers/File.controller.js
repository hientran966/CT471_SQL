const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const FileService = require("../services/File.service");

// Tạo file
exports.create = async (req, res, next) => {
    if (!req.body.tenFile) {
        return next(new ApiError(400, "Tên file không được để trống"));
    }
    try {
        const fileService = new FileService(MySQL.pool);
        const document = await fileService.create(req.body);
        if (!document) {
            return next(new ApiError(400, "Không thể tạo file"));
        }
        return res.status(201).json(document);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi tạo file"));
    }
};

// Lấy tất cả file
exports.findAll = async (req, res, next) => {
    try {
        const fileService = new FileService(MySQL.connection);
        const { tenFile, idCongViec, idNguoiTao, idDuAn, task } = req.query;
        const filter = {};
        if (tenFile) filter.tenFile = tenFile;
        if (idCongViec) filter.idCongViec = idCongViec;
        if (idNguoiTao) filter.idNguoiTao = idNguoiTao;
        if (idDuAn) filter.idDuAn = idDuAn;
        if (task) filter.idCongViec = task;
        const documents = await fileService.find(filter);
        return res.json(documents);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách file"));
    }
};

// Lấy file theo id
exports.findOne = async (req, res, next) => {
    try {
        const fileService = new FileService(MySQL.connection);
        const document = await fileService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "File không tồn tại"));
        }
        return res.json(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, `Đã xảy ra lỗi khi lấy file với id=${req.params.id}`)
        );
    }
};

// Lấy tất cả phiên bản file
exports.findAllVersion = async (req, res, next) => {
    try {
        const fileService = new FileService(MySQL.connection);
        const document = await fileService.findVersion(req.params.id);
        if (!document) {
            return next(new ApiError(404, "File không tồn tại"));
        }
        return res.json(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, `Đã xảy ra lỗi khi lấy tất cả phiên bản file`)
        );
    }
};

// Lấy phiên bản file theo id
exports.findVersion = async (req, res, next) => {
    try {
        const fileService = new FileService(MySQL.connection);
        const document = await fileService.findVersionById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "File không tồn tại"));
        }
        return res.json(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, `Đã xảy ra lỗi khi lấy phiên bản file`)
        );
    }
};

// Cập nhật file
exports.update = async (req, res, next) => {
    try {
        const fileService = new FileService(MySQL.connection);
        const document = await fileService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "File không tồn tại"));
        }
        return res.json(document);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi cập nhật file"));
    }
};

// Thêm phiên bản file
exports.addVersion = async (req, res, next) => {
    if (!req.body.tenFile || !req.body.fileDataBase64) {
        return next(new ApiError(400, "Thiếu dữ liệu file hoặc nội dung file"));
    }
    try {
        const fileService = new FileService(MySQL.connection);
        const document = await fileService.addVersion(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "File không tồn tại"));
        }
        return res.json(document);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi thêm phiên bản file"));
    }
};

// Xóa file
exports.delete = async (req, res, next) => {
    try {
        const fileService = new FileService(MySQL.connection);
        const deletedId = await fileService.delete(req.params.id);
        if (!deletedId) {
            return next(new ApiError(404, "File không tồn tại"));
        }
        return res.json({ message: "Xóa file thành công" });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa file"));
    }
};

// Xóa tất cả file
exports.deleteAll = async (req, res, next) => {
    try {
        const fileService = new FileService(MySQL.connection);
        await fileService.deleteAll();
        return res.json({ message: "Xóa tất cả file thành công" });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả file"));
    }
};

// Duyệt file
exports.approve = async (req, res, next) => {
    try {
        const fileService = new FileService(MySQL.connection);
        const document = await fileService.approve(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "File không tồn tại"));
        }
        return res.json(document);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi duyệt file"));
    }
};

// Cập nhật avatar người dùng
exports.uploadAvatar = async (req, res, next) => {
    const userId = req.params.id;
    const { tenFile, fileDataBase64 } = req.body;

    if (!tenFile || !fileDataBase64) {
        return next(new ApiError(400, "Thiếu dữ liệu file hoặc nội dung file"));
    }

    try {
        const fileService = new FileService(MySQL.pool);
        const result = await fileService.updateAvatar(userId, req.body);
        return res.status(200).json({
            message: "Cập nhật ảnh đại diện thành công",
            result,
        });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi cập nhật avatar"));
    }
};
