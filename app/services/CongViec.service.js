class TaskService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractTaskData(payload) {
        return {
            id: payload.id,
            tenCV: payload.tenCV,
            moTa: payload.moTa,
            doUuTien: payload.doUuTien ?? "Thấp",
            doQuanTrong: payload.doQuanTrong ?? 0,
            ngayBD: payload.ngayBD,
            ngayKT: payload.ngayKT,
            tienDo: payload.tienDo ?? 0,
            trangThai: payload.trangThai ?? "Chưa bắt đầu",
            deactive: payload.deactive ?? null,
            idNguoiTao: payload.idNguoiTao,
            idNhomCV: payload.idNhomCV ?? null,
            idDuAn: payload.idDuAn,
        };
    }

    async create(payload) {
        const task = await this.extractTaskData(payload);
        const [result] = await this.mysql.execute(
            "INSERT INTO CongViec (id, tenCV, moTa, doUuTien, doQuanTrong, ngayBD, ngayKT, tienDo, trangThai, deactive, idNguoiTao, idNhomCV, idDuAn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                task.id,
                task.tenCV,
                task.moTa,
                task.doUuTien,
                task.doQuanTrong,
                task.ngayBD,
                task.ngayKT,
                task.tienDo,
                task.trangThai,
                task.deactive,
                task.idNguoiTao,
                task.idNhomCV,
                task.idDuAn,
            ]
        );
        return { id: result.insertId, ...task };
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM CongViec WHERE deactive IS NULL";
        let params = [];

        if (filter.tenCV) {
            sql += " AND tenCV LIKE ?";
            params.push(`%${filter.tenCV}%`);
        }
        if (filter.trangThai) {
            sql += " AND trangThai = ?";
            params.push(filter.trangThai);
        }
        if (filter.idDuAn) {
            sql += " AND idDuAn = ?";
            params.push(filter.idDuAn);
        }
        if (filter.ngayBD) {
            sql += " AND ngayBD >= ?";
            params.push(filter.ngayBD);
        }
        if (filter.ngayKT) {
            sql += " AND ngayKT <= ?";
            params.push(filter.ngayKT);
        }
        if (filter.idNhomCV) {
            sql += " AND idNhomCV = ?";
            params.push(filter.idNhomCV);
        }
        if (filter.idNguoiTao) {
            sql += " AND idNguoiTao = ?";
            params.push(filter.idNguoiTao);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM CongViec WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const task = await this.extractTaskData(payload);
        let sql = "UPDATE CongViec SET ";
        const fields = [];
        const params = [];
        for (const key in task) {
            if (key === "id") continue;
            fields.push(`${key} = ?`);
            params.push(task[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...task, id };
    }

    async delete(id) {
        const user = await this.findById(id);
        if (!user) return null;
        const deletedAt = new Date();
        await this.mysql.execute("UPDATE CongViec SET deactive = ? WHERE id = ?", [deletedAt, id]);
        return { ...user, deactive: deletedAt };
    }

    async restore(id) {
        const [result] = await this.mysql.execute(
            "UPDATE CongViec SET deactive = NULL WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async deleteAll() {
        const deletedAt = new Date();
        await this.mysql.execute("UPDATE CongViec SET deactive = ?", [deletedAt]);
        return true;
    }
}

module.exports = TaskService;