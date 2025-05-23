const bcrypt = require("bcrypt");

class AuthService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractAuthData(payload) {
        const auth = {
            email: payload.email,
            tenNV: payload.tenNV,
            gioiTinh: payload.gioiTinh ?? "Nam",
            SDT: payload.SDT,
            diaChi: payload.diaChi,
            vaiTro: payload.vaiTro ?? "Nhân Viên",
            idPhong: payload.idPhong ?? null,
            deactive: payload.deactive ?? null,
        };
        Object.keys(auth).forEach((key) => {
            if (auth[key] === undefined) delete auth[key];
        });
        return auth;
    }

    async create(payload) {
        // Kiểm tra dữ liệu đầu vào
        if (!payload) {
            throw new Error("Không có dữ liệu đầu vào");
        }
        // Kiểm tra các trường bắt buộc
        if (!payload.tenNV) {
            throw new Error("Cần có tên nhân viên");
        }
        if (!payload.email || !payload.Password) {
            throw new Error("Cần có email và mật khẩu");
        }
        // Kiểm tra tài khoản đã tồn tại
        const [email] = await this.mysql.execute(
            "SELECT * FROM TaiKhoan WHERE email = ?",
            [payload.email]
        );
        if (email.length > 0) throw new Error("Tài khoản đã tồn tại");

        const auth = await this.extractAuthData(payload);
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction(); // Bắt đầu Transaction
            const [rows] = await connection.execute("SELECT id FROM TaiKhoan WHERE id LIKE 'AC%%%%%%' ORDER BY id DESC LIMIT 1");
            let newIdNumber = 1;
            if (rows.length > 0) {
                const lastId = rows[0].id;
                const num = parseInt(lastId.slice(2), 10);
                if (!isNaN(num)) newIdNumber = num + 1;
            }
            const newId = "AC" + newIdNumber.toString().padStart(6, "0");
            auth.id = newId;

            const hashedPassword = await bcrypt.hash(payload.Password, 10);

            // Thêm tài khoản mới
            await connection.execute(
                `INSERT INTO TaiKhoan (id, email, tenNV, gioiTinh, SDT, diaChi, vaiTro, Password, deactive, idPhong)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    auth.id,
                    auth.email,
                    auth.tenNV,
                    auth.gioiTinh,
                    auth.SDT,
                    auth.diaChi,
                    auth.vaiTro,
                    hashedPassword,
                    auth.deactive,
                    auth.idPhong,
                ]
            );
                await connection.commit(); // Commit Transaction
            return { id: auth.id, email: auth.email, vaiTro: auth.vaiTro };
        } catch (error) {
            await connection.rollback(); // Rollback Transaction
            throw error; // Ném lại lỗi để xử lý ở nơi khác
        } finally {
            connection.release(); // Giải phóng kết nối
        }
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM TaiKhoan WHERE deactive IS NULL";
        let params = [];
        if (filter.email) {
            sql += " AND email LIKE ?";
            params.push(`%${filter.email}%`);
        }
        if (filter.vaiTro) {
            sql += " AND vaiTro = ?";
            params.push(filter.vaiTro);
        }
        if (filter.tenNV) {
            sql += " AND tenNV LIKE ?";
            params.push(`%${filter.tenNV}%`);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM TaiKhoan WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const update = await this.extractAuthData(payload);
        let sql = "UPDATE TaiKhoan SET ";
        const fields = [];
        const params = [];
        for (const key in update) {
            if (key === "id") continue;
            if (key === "Password") continue;
            fields.push(`${key} = ?`);
            params.push(update[key]);
        }
        if (payload.Password) {
            fields.push("Password = ?");
            params.push(await bcrypt.hash(payload.Password, 10));
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);

        await this.mysql.execute(sql, params);
        return this.findById(id);
    }

    async delete(id) {
        const user = await this.findById(id);
        if (!user) return null;
        const deletedAt = new Date();
        await this.mysql.execute("UPDATE TaiKhoan SET deactive = ? WHERE id = ?", [deletedAt, id]);
        return { ...user, deactive: deletedAt };
    }

    async restore(id) {
        const [result] = await this.mysql.execute(
            "UPDATE TaiKhoan SET deactive = NULL WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async deleteAll() {
        const deletedAt = new Date();
        await this.mysql.execute("UPDATE TaiKhoan SET deactive = ?", [deletedAt]);
        return true;
    }

    async comparePassword(inputPassword, storedPassword) {
        return await bcrypt.compare(inputPassword, storedPassword);
    }

    async login(email, Password) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM TaiKhoan WHERE email = ?",
            [email]
        );
        const auth = rows[0];
        if (!auth || !(await this.comparePassword(Password, auth.password))) {
            throw new Error("Invalid credentials");
        }
        return { id: auth.id, email: auth.email, vaiTro: auth.vaiTro };
    }
}

module.exports = AuthService;