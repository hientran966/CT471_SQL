class ProjectService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractProjectData(payload) {
        return {
            id: payload.id,
            tenDA: payload.tenDA,
            ngayBD: payload.ngayBD,
            ngayKT: payload.ngayKT,
            trangThai: payload.trangThai ?? "Chưa bắt đầu",
            deactive: payload.deactive ?? null,
            idNguoiTao: payload.idNguoiTao,
        };
    }

    async create(payload) {
        const project = await this.extractProjectData(payload);
        const [result] = await this.mysql.execute(
            "INSERT INTO DuAn (id, tenDA, ngayBD, ngayKT, deactive, trangThai, idNguoiTao) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                project.id,
                project.tenDA,
                project.ngayBD,
                project.ngayKT,
                project.deactive,
                project.trangThai,
                project.idNguoiTao,
            ]
        );
        return { ...project };
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM DuAn";
        let params = [];
        if (filter.tenDA) {
            sql += " WHERE tenDA LIKE ?";
            params.push(`%${filter.tenDA}%`);
        }
        if (filter.trangThai) {
            sql += params.length ? " AND" : " WHERE";
            sql += " trangThai = ?";
            params.push(filter.trangThai);
        }
        if (filter.idNguoiTao) {
            sql += params.length ? " AND" : " WHERE";
            sql += " idNguoiTao = ?";
            params.push(filter.idNguoiTao);
        }
        if (filter.ngayBD) {
            sql += params.length ? " AND" : " WHERE";
            sql += " ngayBD >= ?";
            params.push(filter.ngayBD);
        }
        if (filter.ngayKT) {
            sql += params.length ? " AND" : " WHERE";
            sql += " ngayKT <= ?";
            params.push(filter.ngayKT);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM DuAn WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const project = await this.extractProjectData(payload);
        let sql = "UPDATE DuAn SET ";
        const fields = [];
        const params = [];
        for (const key in project) {
            fields.push(`${key} = ?`);
            params.push(project[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return this.findById(id);
    }

    async delete(id) {
        await this.mysql.execute("DELETE FROM DuAn WHERE id = ?", [id]);
        return id;
    }

    async deleteAll() {
        await this.mysql.execute("DELETE FROM DuAn");
        return true;
    }
}

module.exports = ProjectService;