class AssignmentService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractAssignmentData(payload) {
        return {
            id: payload.id,
            congViec: payload.congViec,
            nguoiGiao: payload.nguoiGiao,
            nguoiNhan: payload.nguoiNhan,
            ngayNhan: payload.ngayNhan ?? null,
            ngayHoanTat: payload.ngayHoanTat ?? null,
            trangThai: payload.trangThai ?? "Chưa được nhận",
        };
    }

    async create(payload) {
        const assignment = this.extractAssignmentData(payload);
        const [result] = await this.mysql.execute(
            "INSERT INTO PhanCong (id, congViec, nguoiGiao, nguoiNhan, ngayNhan, ngayHoanTat, trangThai) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                assignment.id,
                assignment.congViec,
                assignment.nguoiGiao,
                assignment.nguoiNhan,
                assignment.ngayNhan,
                assignment.ngayHoanTat,
                assignment.trangThai,
            ]
        );
        return { ...assignment };
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM PhanCong";
        let params = [];
        if (filter.trangThai) {
            sql += params.length ? " AND" : " WHERE";
            sql += " trangThai = ?";
            params.push(filter.trangThai);
        }
        if (filter.nguoiNhan) {
            sql += params.length ? " AND" : " WHERE";
            sql += " nguoiNhan = ?";
            params.push(filter.nguoiNhan);
        }
        if (filter.congViec) {
            sql += params.length ? " AND" : " WHERE";
            sql += " congViec = ?";
            params.push(filter.congViec);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM PhanCong WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const assignment = this.extractAssignmentData(payload);
        let sql = "UPDATE PhanCong SET ";
        const fields = [];
        const params = [];
        for (const key in assignment) {
            fields.push(`${key} = ?`);
            params.push(assignment[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...assignment };
    }

    async delete(id) {
        const assignment = await this.findById(id);
        if (!assignment) return null;
        await this.mysql.execute("DELETE FROM PhanCong WHERE id = ?", [id]);
        return id;
    }

    async deleteAll() {
        await this.mysql.execute("DELETE FROM PhanCong");
        return true;
    }
}

module.exports = AssignmentService;