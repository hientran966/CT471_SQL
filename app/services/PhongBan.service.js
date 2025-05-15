class DepartmentService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    extractDepartmentData(payload) {
        return {
            id: payload.id,
            tenPhongBan: payload.tenPhongBan,
        };
    }

    async create(payload) {
        const department = this.extractDepartmentData(payload);
        const [result] = await this.mysql.execute(
            "INSERT INTO PhongBan (id, tenPhongBan) VALUES (?, ?)",
            [
                department.id,
                department.tenPhongBan
            ]
        );
        return { id: department.id, tenPhongBan: department.tenPhongBan };
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM PhongBan";
        let params = [];
        if (filter.tenPhongBan) {
            sql += " WHERE tenPhongBan LIKE ?";
            params.push(`%${filter.tenPhongBan}%`);
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
        const department = this.extractDepartmentData(payload);
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
    }

    async delete(id) {
        await this.mysql.execute("DELETE FROM PhongBan WHERE id = ?", [id]);
    }

    async deleteAll() {
        await this.mysql.execute("DELETE FROM PhongBan");
    }
}

module.exports = DepartmentService;