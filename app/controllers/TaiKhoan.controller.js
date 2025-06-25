const ApiError = require("../api-error");
const MySQL = require("../utils/mysql.util");
const path = require("path");
const fs = require("fs");
const AuthService = require("../services/TaiKhoan.service");

//Tạo tài khoản
exports.create = async (req, res, next) => {
    if (!req.body.email) {
        return next(new ApiError(400, "Email can not be empty"));
    }

    try {
        const authService = new AuthService(MySQL.pool);
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

//Lấy avatar
exports.getAvatar = async (req, res, next) => {
    try {
        const authService = new AuthService(MySQL.connection);
        const duongDan = await authService.getAvatar(req.params.id);
        if (!duongDan) {
            return next(new ApiError(404, "Avatar not found"));
        }
        const absolutePath = path.isAbsolute(duongDan)
            ? duongDan
            : path.join(__dirname, "..", "..", duongDan);
        fs.access(absolutePath, fs.constants.F_OK, (err) => {
            if (err) {
                return next(new ApiError(404, "Avatar file not found"));
            }
            res.sendFile(absolutePath);
        });
    } catch (error) {
        console.error("Get avatar error:", error);
        next(new ApiError(500, "An error occurred while retrieving the avatar"));
    }
};

//Lấy tài khoản vô hiệu
exports.getDeactive = async (req, res, next) => {
    let documents = [];

    try {
        const authService = new AuthService(MySQL.connection);
        //Nếu có tham số tìm kiếm thì tìm kiếm theo tham số đó
        const {tenNV, email} = req.query;
        if (tenNV || email) {
            documents = await authService.getDeactive({
                tenNV,
                email
            });
        } else {
            documents = await authService.getDeactive({});
        }
    } catch (error) {
        console.error(error);
        return next(
            new ApiError(500, "An error occurred while retrieving the account")
        );
    }

    return res.send(documents);
};

//Lấy phòng ban của tài khoản
exports.getUserDepartment = async (req, res, next) => {
    try {
        const authService = new AuthService(MySQL.connection);
        const department = await authService.getUserDepartment(req.params.id);
        if (!department) {
            return next(new ApiError(404, "Department not found"));
        }
        return res.send(department);
    } catch (error) {
        console.error("Get user department error:", error);
        next(new ApiError(500, "An error occurred while retrieving user department"));
    }
}

//Lấy danh sách tài khoản cùng phòng ban
exports.getDepartment = async (req, res, next) => {
    try {
        const authService = new AuthService(MySQL.connection);
        const accounts = await authService.getDepartment(req.params.id);
        return res.send(accounts);
    } catch (error) {
        console.error("Get department error:", error);
        next(new ApiError(500, "An error occurred while retrieving department accounts"));
    }
};

//Đổi mật khẩu
exports.changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return next(new ApiError(400, "Old password and new password are required"));
    }

    try {
        const authService = new AuthService(MySQL.connection);
        const result = await authService.changePassword(req.params.id, oldPassword, newPassword);
        return res.send(result);
    } catch (error) {
        console.error("Change password error:", error);
        const statusCode = error.statusCode || 500;
        const message = error.message || "An error occurred while changing the password";
        next(new ApiError(statusCode, message));
    }
};

// Lấy số công việc đang thực hiện
exports.getAssignNumber = async (req, res, next) => {
    try {
        const authService = new AuthService(MySQL.connection);
        const count = await authService.getAssignNumber(req.params.id);
        return res.send({ count });
    } catch (error) {
        console.error("Get assignments count error:", error);
        next(new ApiError(500, "An error occurred while retrieving assignments count"));
    }
}

// Lấy phân quyền của tài khoản
exports.getRole = async (req, res, next) => {
    try {
        const authService = new AuthService(MySQL.connection);
        const permissions = await authService.getRole(req.params.id);
        return res.send(permissions);
    } catch (error) {
        console.error("Get permissions error:", error);
        next(new ApiError(500, "An error occurred while retrieving permissions"));
    }
}