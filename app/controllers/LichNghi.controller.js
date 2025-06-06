const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const CalendarService = require ("../services/LichNghi.service");

//Tạo lịch nghỉ
exports.create = async (req, res, next) => {
    if (!req.body.ngayBD) {
        return next(new ApiError(400, "Ngày bắt đầu không được để trống"));
    }
    if (!req.body.ngayKT) {
        return next(new ApiError(400, "Ngày kết thúc không được để trống"));
    }

    try {
        const calendarService = new CalendarService(MySQL.pool);
        const document = await calendarService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo lịch nghỉ")
        );
    }
};

//Lấy tất cả lịch
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const calendarService = new CalendarService(MySQL.connection);
        //Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const {moTa, ngayBD, ngayKT} = req.query;
        if (moTa || ngayBD || ngayKT) {
            documents = await calendarService.find({
                moTa,
                ngayBD,
                ngayKT,
            });
        } else {
            documents = await calendarService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách lịch")
        );
    }

    return res.send(documents);
};


//Lấy lịch theo id
exports.findOne = async (req, res, next) => {
    try {
        const calendarService = new CalendarService(MySQL.connection);
        const document = await calendarService.findById(req.params.id);
        if (!document){
            return next(new ApiError(404, "Lịch không tồn tại"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Đã xảy ra lỗi khi lấy lịch với id=${req.params.id}`
            )
        );
    }
};

//Cập nhật lịch
exports.update = async (req, res, next) => {
    try {
        const calendarService = new CalendarService(MySQL.connection);
        const document = await calendarService.update(req.params.id, req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi cập nhật lịch")
        );
    }
};

//Xóa lịch
exports.delete = async (req, res, next) => {
    try {
        const calendarService = new CalendarService(MySQL.connection);
        await calendarService.delete(req.params.id);
        return res.send({ message: "Xóa lịch thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa lịch")
        );
    }
};

//Khôi phục lịch
exports.restore = async (req, res, next) => {
    try {
        const calendarService = new CalendarService(MySQL.connection);
        await calendarService.restore(req.params.id);
        return res.send({ message: "Khôi phục lịch thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi khôi phục lịch")
        );
    }
};

//Xóa tất cả lịch
exports.deleteAll = async (req, res, next) => {
    try {
        const calendarService = new CalendarService(MySQL.connection);
        await calendarService.deleteAll();
        return res.send({ message: "Xóa tất cả lịch thành công" });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả lịch")
        );
    }
};

//Tạo ngày bù
exports.createNgayBu = async (req, res, next) => {
    if (!req.body.ngayBDBu || !req.body.ngayKTBu) {
        return next(new ApiError(400, "Ngày bắt đầu và kết thúc ngày bù không được để trống"));
    }

    try {
        const calendarService = new CalendarService(MySQL.pool);
        const idNgayBu = await calendarService.createDate(req.body);
        return res.send({ idNgayBu });
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "Đã xảy ra lỗi khi tạo ngày bù")
        );
    }
};

exports.getNgayBu = async (req, res, next) => {
    try {
        const calendarService = new CalendarService(MySQL.connection);
        const ngayBu = await calendarService.getNgayBu(req.params.idNgayBu);
        if (!ngayBu) {
            return next(new ApiError(404, "Không tìm thấy ngày bù"));
        }
        return res.send(ngayBu);
    } catch (error) {
        console.error(error);
        return next(new ApiError(500, "Đã xảy ra lỗi khi lấy ngày bù"));
    }
};