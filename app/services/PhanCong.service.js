class AssignmentService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractAssignmentData(payload) {
        return {
            id: payload.id,
            moTa: payload.moTa,
            idCongViec: payload.idCongViec,
            tienDoCaNhan: payload.tienDoCaNhan,
            idNguoiNhan: payload.idNguoiNhan,
            ngayNhan: payload.ngayNhan ?? null,
            ngayHoanTat: payload.ngayHoanTat ?? null,
            trangThai: payload.trangThai ?? "Chưa bắt đầu",
        };
    }

    async create(payload) {
        const assignment = await this.extractAssignmentData(payload);
        const [result] = await this.mysql.execute(
            "INSERT INTO PhanCong (id, idCongViec, tienDoCaNhan, idNguoiNhan, ngayNhan, ngayHoanTat, trangThai, moTa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                assignment.id,
                assignment.idCongViec,
                assignment.tienDoCaNhan,
                assignment.idNguoiNhan,
                assignment.ngayNhan,
                assignment.ngayHoanTat,
                assignment.trangThai,
                assignment.moTa,
            ]
        );
        return { ...assignment };
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM PhanCong WHERE deactive IS NULL";
        let params = [];
        if (filter.trangThai) {
            sql += " AND trangThai = ?";
            params.push(filter.trangThai);
        }
        if (filter.idNguoiNhan) {
            sql += " AND idNguoiNhan = ?";
            params.push(filter.idNguoiNhan);
        }
        if (filter.idCongViec) {
            sql += " AND idCongViec = ?";
            params.push(filter.idCongViec);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM PhanCong WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const assignment = await this.extractAssignmentData(payload);
        let sql = "UPDATE PhanCong SET ";
        const fields = [];
        const params = [];
        for (const key in assignment) {
            if (key === "id") continue;
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
        const deletedAt = new Date();
        await this.mysql.execute(
            "UPDATE PhanCong SET deactive = ? WHERE id = ?",
            [deletedAt, id]
        );
        return id;
    }

    async restore(id) {
        const [result] = await this.mysql.execute(
            "UPDATE PhanCong SET deactive = NULL WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async deleteAll() {
        const deletedAt = new Date();
        await this.mysql.execute(
            "UPDATE PhanCong SET deactive = ? WHERE deactive IS NULL",
            [deletedAt]
        );
        return true;
    }
}

module.exports = AssignmentService;