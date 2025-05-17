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
        let sql = "SELECT * FROM PhongBan";
        let params = [];
        if (filter.tenPhong) {
            sql += " WHERE tenPhong LIKE ?";
            params.push(`%${filter.tenPhong}%`);
        }
        if (filter.phanQuyen) {
            sql += params.length ? " AND" : " WHERE";
            sql += " phanQuyen = ?";
            params.push(filter.phanQuyen);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM PhongBan WHERE id = ?",
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
            fields.push(`${key} = ?`);
            params.push(department[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { id: department.id, tenPhong: department.tenPhong };
    }

    async delete(id) {
        await this.mysql.execute("DELETE FROM PhongBan WHERE id = ?", [id]);
        return id;
    }

    async deleteAll() {
        await this.mysql.execute("DELETE FROM PhongBan");
        return true;
    }
}

module.exports = DepartmentService;