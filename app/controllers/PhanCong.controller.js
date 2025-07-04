const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const AssignmentService = require("../services/PhanCong.service");

//Thêm mới
exports.create = async (req, res, next) => {
    if (!req.body.idNguoiNhan) {
        return next(new ApiError(400, "Người nhận không được để trống"));
    }
    if (!req.body.idCongViec) {
        return next(new ApiError(400, "Công việc không được để trống"));
    }
    try {
        const assignmentService = new AssignmentService(MySQL.pool);
        const document = await assignmentService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo tham gia")
        );
    }
};

//Lấy tất cả
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const assignmentService = new AssignmentService(MySQL.connection);
        //Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const {ngayNhan, ngayHoanTat, trangThai, idNguoiNhan, idCongViec} = req.query;
        if (ngayNhan || ngayHoanTat || trangThai || idNguoiNhan || idCongViec) {
            documents = await assignmentService.find({
                ngayNhan,
                ngayHoanTat,
                trangThai,
                idNguoiNhan,
                idCongViec
            });
        } else {
            documents = await assignmentService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách tham gia")
        );
    }

    return res.send(documents);
};

//Lấy tham gia theo id
exports.findOne = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.connection);
        const document = await assignmentService.findById(req.params.id);
        if (!document){
            return next(new ApiError(404, "Tham gia không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi lấy tham gia với id=${req.params.id}`
            )
        );
    }
};

//Lấy lịch sử chuyển giao
exports.findTransferHistory = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.connection);
        const document = await assignmentService.findTransferHistory(req.params.id);
        if (!document){
            return next(new ApiError(404, "Tham gia không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi lấy lịch sử chuyển giao với id=${req.params.id}`
            )
        );
    }
};

//Lấy chuỗi chuyển giao
exports.getFullTransferChain = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.connection);
        const chain = await assignmentService.getFullTransferChain(req.params.id);
        return res.send(chain);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Lỗi khi lấy chuỗi chuyển giao"));
    }
};

//Cập nhật
exports.update = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.connection);
        const document = await assignmentService.update(req.params.id, req.body);
        if (!document){
            return next(new ApiError(404, "Tham gia không tồn tại"));
        }  
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi cập nhật tham gia với id=${req.params.id}`
            )
        );
    }
}

//Xóa
exports.delete = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.connection);
        const document = await assignmentService.delete(req.params.id);
        if (!document){
            return next(new ApiError(404, "Tham gia không tồn tại"));
        }
        return res.send({message: "Tham gia đã được xóa thành công"});
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi xóa tham gia với id=${req.params.id}`
            )
        );
    }
};

//Khôi phục
exports.restore = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.connection);
        const document = await assignmentService.restore(req.params.id);
        if (!document){
            return next(new ApiError(404, "Tham gia không tồn tại"));
        }
        return res.send({message: "Khôi phục tham gia thành công"});
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi khôi phục tham gia")
        );
    }
};

//Xóa tất cả
exports.deleteAll = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.connection);
        const document = await assignmentService.deleteAll();
        return res.send({message: "Xóa tất cả tham gia thành công"});
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả tham gia")
        );
    }
};

//Lấy tham gia theo công việc
exports.findByTask = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.connection);
        const documents = await assignmentService.findByTask(req.params.task);
        return res.send(documents);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, `Đã xảy ra lỗi khi lấy tham gia cho công việc với id=${req.params.task}`)
        );
    }
};

//Báo cáo
exports.report = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.pool);
        const fileId = req.body.idDinhKem || null;
        const result = await assignmentService.report(req.params.id, req.body);
        if (!result) {
            return next(new ApiError(404, "Không tìm thấy phân công để báo cáo"));
        }
        return res.send(result);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi gửi báo cáo"));
    }
};

// Bắt đầu chuyển giao
exports.startTransfer = async (req, res, next) => {
    if (!req.body.idNguoiNhan) {
        return next(new ApiError(400, "Người nhận mới không được để trống"));
    }
    try {
        const assignmentService = new AssignmentService(MySQL.pool);
        
        const result = await assignmentService.initiateTransfer(req.params.id, req.body);
        if (!result) {
            return next(new ApiError(404, "Không tìm thấy phân công để bắt đầu chuyển giao"));
        }
        return res.send(result);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi bắt đầu chuyển giao")
        );
    }
};

// Hoàn tất chuyển giao
exports.completeTransfer = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.pool);
        const result = await assignmentService.acceptTransfer(req.params.id, req.body);
        if (!result) {
            return next(new ApiError(404, "Không tìm thấy phân công để hoàn tất chuyển giao"));
        }
        return res.send(result);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi hoàn tất chuyển giao")
        );
    }
};

// Từ chối chuyển giao
exports.rejectTransfer = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.pool);
        const result = await assignmentService.rejectTransfer(req.params.id);
        if (!result) {
            return next(new ApiError(404, "Không tìm thấy phân công để từ chối chuyển giao"));
        }
        return res.send(result);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi từ chối chuyển giao")
        );
    }
};

// Lấy chuỗi chuyển giao theo người dùng
exports.getTransferByUser = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.pool);
        const userId = req.params.id;
        const idCongViec = req.query.idCongViec || null;
        const chain = await assignmentService.getTransferByUser(userId, idCongViec);
        if (!chain) {
            return next(new ApiError(404, "Không tìm thấy chuỗi chuyển giao cho người dùng"));
        }
        return res.send(chain);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy chuỗi chuyển giao"));
    }
};

// Lấy chuyển giao đang chờ
exports.getPendingTransfer = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.pool);
        const pendingTransfer = await assignmentService.getPendingTransfer(req.params.id);
        if (!pendingTransfer) {
            return next(new ApiError(404, "Không tìm thấy chuyển giao đang chờ"));
        }
        return res.send(pendingTransfer);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy chuyển giao đang chờ"));
    }
};

// Lấy báo cáo
exports.getReport = async (req, res, next) => {
    try {
        const assignmentService = new AssignmentService(MySQL.pool);
        const report = await assignmentService.getReportById(req.params.id);
        if (!report) {
            return next(new ApiError(404, "Không tìm thấy báo cáo cho phân công này"));
        }
        return res.send(report);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy báo cáo"));
    }
};