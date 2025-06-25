const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const NotificationService = require("../services/ThongBao.service");

// Tạo thông báo
exports.create = async (req, res, next) => {
    if (!req.body.noiDung) {
        return next(new ApiError(400, "Nội dung không được để trống"));
    }

    try {
        const notificationService = new NotificationService(MySQL.pool);
        const document = await notificationService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi tạo thông báo"));
    }
};

// Lấy tất cả thông báo (có filter và phân trang)
exports.findAll = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        const {
            noiDung, tieuDe, ngayDang, idNguoiDang,
            idPhanCong, idCongViec, idDuAn, idPhanHoi,
            page = 1, pageSize = 20
        } = req.query;

        const filter = {
            noiDung, tieuDe, ngayDang, idNguoiDang,
            idPhanCong, idCongViec, idDuAn, idPhanHoi
        };

        Object.keys(filter).forEach((key) => {
            if (filter[key] == null || filter[key] === '') {
                delete filter[key];
            }
        });

        const documents = await notificationService.find(filter, {
            page: Number(page),
            pageSize: Number(pageSize)
        });

        return res.send(documents);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách thông báo"));
    }
};

// Lấy thông báo theo ID
exports.findOne = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        const document = await notificationService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Thông báo không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Đã xảy ra lỗi khi lấy thông báo với id=${req.params.id}`)
        );
    }
};

// Cập nhật thông báo
exports.update = async (req, res, next) => {
    if (!req.body.noiDung) {
        return next(new ApiError(400, "Nội dung không được để trống"));
    }

    try {
        const notificationService = new NotificationService(MySQL.pool);
        const updated = await notificationService.update(req.params.id, req.body);
        if (!updated) {
            return next(new ApiError(404, "Thông báo không tồn tại hoặc không có gì để cập nhật"));
        }
        return res.send(updated);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi cập nhật thông báo"));
    }
};

// Xoá thông báo
exports.delete = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        const result = await notificationService.delete(req.params.id);
        if (!result) {
            return next(new ApiError(404, "Thông báo không tồn tại"));
        }
        return res.send({ message: "Thông báo đã được xóa thành công" });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa thông báo"));
    }
};

// Xoá tất cả thông báo (set deactive)
exports.deleteAll = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        await notificationService.deleteAll();
        return res.send({ message: "Xóa tất cả thông báo thành công" });
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả thông báo"));
    }
};

// Lấy thông báo theo công việc
exports.findByTask = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        const documents = await notificationService.getNotificationByTaskId(req.params.id);
        return res.send(documents);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy thông báo theo công việc"));
    }
};

// Lấy thông báo theo dự án
exports.findByProject = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        const documents = await notificationService.getNotificationByProjectId(req.params.id);
        return res.send(documents);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy thông báo theo dự án"));
    }
};

// Lấy thông báo theo nhóm công việc
exports.findByGroup = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        const documents = await notificationService.getNotificationByGroupId(req.params.id);
        return res.send(documents);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy thông báo theo nhóm công việc"));
    }
};

// Lấy thông báo theo phân công
exports.findByAssignment = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        const documents = await notificationService.getNotificationByAssignmentId(req.params.id);
        return res.send(documents);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy thông báo theo phân công"));
    }
};

// Lấy thông báo theo phản hồi
exports.findByComment = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        const documents = await notificationService.getNotificationByCommentId(req.params.id);
        return res.send(documents);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy thông báo theo phản hồi"));
    }
};

// Lấy thông báo theo phiên bản
exports.findByVersion = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        const documents = await notificationService.getNotificationByVersionId(req.params.id);
        return res.send(documents);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy thông báo theo phiên bản"));
    }
};

// Lấy thông báo theo người dùng
exports.findByUser = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        const documents = await notificationService.getNotificationByUserId(req.params.id);
        return res.send(documents);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy thông báo theo người dùng"));
    }
};

// Lấy thông báo theo người nhận
exports.findByReceive = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MySQL.pool);
        const documents = await notificationService.getNotificationByReceive(req.params.id);
        return res.send(documents);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy thông báo theo người nhận"));
    }
};