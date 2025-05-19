class DepartmentService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractDepartmentData(payload) {
        return {
            id: payload.id,
            tenPhong: payload.tenPhong,
            phanQuyen: payload.phanQuyen ?? "Thấp",
            deactive: payload.deactive ?? null,
        };
    }

    async create(payload) {
        const department = await this.extractDepartmentData(payload);
        const [result] = await this.mysql.execute(
            "INSERT INTO PhongBan (id, tenPhong, phanQuyen, deactive) VALUES (?, ?, ?, ?)",
            [
                department.id,
                department.tenPhong,
                department.phanQuyen,
                department.deactive,
            ]
        );
        return { id: department.id, tenPhong: department.tenPhong };
    }
    async find(filter = {}) {
        let sql = "SELECT * FROM PhongBan WHERE deactive IS NULL";
        let params = [];
        if (filter.tenPhong) {
            sql += " AND tenPhong LIKE ?";
            params.push(`%${filter.tenPhong}%`);
        }
        if (filter.phanQuyen) {
            sql += " AND phanQuyen = ?";
            params.push(filter.phanQuyen);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM PhongBan WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const department = await this.extractDepartmentData(payload);
        let sql = "UPDATE PhongBan SET ";
        const fields = [];
        const params = [];
        for (const key in department) {
            if (key === "id") continue;
            fields.push(`${key} = ?`);
            params.push(department[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { id: department.id, tenPhong: department.tenPhong };
    }

    async delete(id) {
        const deletedAt = new Date();
        await this.mysql.execute(
            "UPDATE PhongBan SET deactive = ? WHERE id = ?",
            [deletedAt, id]
        );
        return id;
    }

    async restore(id) {
        const [result] = await this.mysql.execute(
            "UPDATE PhongBan SET deactive = NULL WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async deleteAll() {
        const deletedAt = new Date();
        await this.mysql.execute(
            "UPDATE PhongBan SET deactive = ? WHERE deactive IS NULL",
            [deletedAt]
        );
        return true;
    }
}

module.exports = DepartmentService;