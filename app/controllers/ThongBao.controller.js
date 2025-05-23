const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const NoficationService = require("../services/ThongBao.service");

//Tạo thông báo
exports.create = async (req, res, next) => {
    if (!req.body.noiDung) {
        return next(new ApiError(400, "Nội dung không được để trống"));
    }

    try {
        const noficationService = new NoficationService(MySQL.pool);
        const document = await noficationService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo thông báo")
        );
    }
};

//Lấy tất cả thông báo
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const noficationService = new NoficationService(MySQL.connection);
        //Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const {noiDung, tieuDe, ngayDang, idNguoiDang, idPhanCong, idCongViec, idNhomCV, idDuAn, idPhanHoi} = req.query;
        if (noiDung || tieuDe || ngayDang || idNguoiDang || idPhanCong || idCongViec || idNhomCV || idDuAn || idPhanHoi) {
            documents = await noficationService.find({
                noiDung,
                tieuDe,
                ngayDang,
                idNguoiDang,
                idPhanCong,
                idCongViec,
                idNhomCV,
                idDuAn,
                idPhanHoi
            });
        } else {
            documents = await noficationService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách thông báo")
        );
    }

    return res.send(documents);
};

//Lấy thông báo theo id
exports.findOne = async (req, res, next) => {
    try {
        const noficationService = new NoficationService(MySQL.connection);
        const document = await noficationService.findById(req.params.id);
        if (!document){
            return next(new ApiError(404, "Thông báo không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi lấy thông báo với id=${req.params.id}`
            )
        );
    }
};

//Cập nhật thông báo
exports.update = async (req, res, next) => {
    if (!req.body.noiDung) {
        return next(new ApiError(400, "Nội dung không được để trống"));
    }

    try {
        const noficationService = new NoficationService(MySQL.connection);
        const document = await noficationService.update(req.params.id, req.body);
        if (!document){
            return next(new ApiError(404, "Thông báo không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi cập nhật thông báo")
        );
    }
};

//Xóa thông báo
exports.delete = async (req, res, next) => {
    try {
        const noficationService = new NoficationService(MySQL.connection);
        const document = await noficationService.delete(req.params.id);
        if (!document){
            return next(new ApiError(404, "Thông báo không tồn tại"));
        }
        return res.send({message: "Thông báo đã được xóa thành công"});
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa thông báo")
        );
    }
};

//Xóa tất cả thông báo
exports.deleteAll = async (req, res, next) => {
    try {
        const noficationService = new NoficationService(MySQL.connection);
        await noficationService.deleteAll();
        return res.send({ message: "Xóa tất cả thông báo thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả thông báo")
        );
    }
};
