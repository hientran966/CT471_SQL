const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const AuthService = require("../services/TaiKhoan.service");

//Tạo tài khoản
exports.create = async (req, res, next) => {
    if (!req.body.email) {
        return next(new ApiError(400, "Email can not be empty"));
    }

    try {
        const authService = new AuthService(MySQL.connection);
        const document = await authService.create(req.body);
        return res.send(document);
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "An error occurred while creating the account")
        );
    } 
};

//Lấy tất cả tài khoản
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const authService = new AuthService(MySQL.connection);
        //Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const {tenNV, email} = req.query;
        if (tenNV || email) {
            documents = await authService.find({
                tenNV,
                email
            });
        } else {
            documents = await authService.find({});
        }
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "An error occurred while retrieving the account")
        );
    }

    return res.send(documents);
};

//Lấy tài khoản theo id
exports.findOne = async (req, res, next) => {
    try {
        const authService = new AuthService(MySQL.connection);
        const document = await authService.findById(req.params.id);
        if (!document){
            return next(new ApiError(404, "Account not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retieving account with id=${req.params.id}`
            )
        );
    }
};

//Cập nhật tài khoản
exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be emty"));
    }

    try {
        const authService = new AuthService(MySQL.connection);
        const document = await authService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Account not found"));
        }
        return res.send({message: "Account was updated successfully"});
    } catch (error) {
        return next(
            new ApiError(500, `Error updating account with id=${req.params.id}`)
        );
    }
};

//Xóa tài khoản
exports.delete = async (req, res, next) => {
    try {
        const authService = new AuthService(MySQL.connection);
        const document = await authService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Account not found"));
        }
        return res.send({message: "Account was deleted successfully"});
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete account with id=${req.params.id}`)
        );
    }
};

//Khoi phục tài khoản
exports.restore = async (req, res, next) => {
    try {
        const authService = new AuthService(MySQL.connection);
        const document = await authService.restore(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Account not found"));
        }
        return res.send({message: "Account was restored successfully"});
    } catch (error) {
        return next(
            new ApiError(500, `Could not restore account with id=${req.params.id}`)
        );
    }
};

//Xóa tất cả tài khoản
exports.deleteAll = async (_req, res, next) => {
    try {
        const authService = new AuthService(MySQL.connection);
        const deletedCount = await authService.deleteAll();
        return res.send({
            message: `${deletedCount} accounts was deleted successfully`
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all accounts")
        );
    }
};

//Đăng nhập
exports.login = async (req, res, next) => {
    try {
        const authService = new AuthService(MySQL.connection);
        const account = await authService.login(req.body.email, req.body.Password);
        res.send(account);
    } catch (error) {
        console.error("Login error:", error);
        next(new ApiError(401, "Login failed"));
    }
};