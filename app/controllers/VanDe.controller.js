const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const CommentService = require("../services/VanDe.service");

//Thêm mới
exports.create = async (req, res, next) => {
    if (!req.body.moTa) {
        return next(new ApiError(400, "Nội dung không được để trống"));
    }
    try {
        const commentService = new CommentService(MySQL.connection);
        const document = await commentService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo bình luận")
        );
    }
};

//Lấy tất cả
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const commentService = new CommentService(MySQL.connection);
        //Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const {noiDung, nguoiGui, idVanDe} = req.query;
        if (noiDung || nguoiGui || idVanDe) {
            documents = await commentService.find({
                noiDung,
                nguoiGui,
                idVanDe
            });
        } else {
            documents = await commentService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách bình luận")
        );
    }

    return res.send(documents);
};

//Lấy bình luận theo id
exports.findOne = async (req, res, next) => {
    try {
        const commentService = new CommentService(MySQL.connection);
        const document = await commentService.findById(req.params.id);
        if (!document){
            return next(new ApiError(404, "Bình luận không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi lấy bình luận với id=${req.params.id}`
            )
        );
    }
};

//Cập nhật bình luận
exports.update = async (req, res, next) => {
    if (!req.body.noiDung) {
        return next(new ApiError(400, "Nội dung không được để trống"));
    }
    if (!req.body.nguoiGui) {
        return next(new ApiError(400, "Người gửi không được để trống"));
    }
    if (!req.body.idVanDe) {
        return next(new ApiError(400, "ID vấn đề không được để trống"));
    }
    try {
        const commentService = new CommentService(MySQL.connection);
        const document = await commentService.update(req.params.id, req.body);
        if (!document){
            return next(new ApiError(404, "Bình luận không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi cập nhật bình luận với id=${req.params.id}`
            )
        );
    }
};

//Xóa bình luận
exports.delete = async (req, res, next) => {
    try {
        const commentService = new CommentService(MySQL.connection);
        const document = await commentService.delete(req.params.id);
        if (!document){
            return next(new ApiError(404, "Bình luận không tồn tại"));
        }
        return res.send({ message: "Xóa bình luận thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa bình luận")
        );
    }
};

//Xóa tất cả bình luận
exports.deleteAll = async (req, res, next) => {
    try {
        const commentService = new CommentService(MySQL.connection);
        await commentService.deleteAll();
        return res.send({ message: "Xóa tất cả bình luận thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả bình luận")
        );
    }
};
