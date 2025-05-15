class TaskService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractTaskData(payload) {
        return {
            id: payload.id,
            tenCV: payload.tenCV,
            moTa: payload.moTa,
            ngayBD: payload.ngayBD,
            ngayKT: payload.ngayKT,
            soNgay: payload.soNgay,
            tienDo: payload.tienDo ?? 0,
            trangThai: payload.trangThai ?? "Chưa bắt đầu",
            duAn: payload.duAn,
        };
    }

    async create(payload) {
        const task = this.extractTaskData(payload);
        const [result] = await this.mysql.execute(
            "INSERT INTO CongViec (id, tenCV, moTa, ngayBD, ngayKT, soNgay, tienDo, trangThai, duAn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                task.id,
                task.tenCV,
                task.moTa,
                task.ngayBD,
                task.ngayKT,
                task.soNgay,
                task.tienDo,
                task.trangThai,
                task.duAn,
            ]
        );
        return { id: result.insertId, ...task };
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM CongViec";
        let params = [];
        if (filter.tenCV) {
            sql += " WHERE tenCV LIKE ?";
            params.push(`%${filter.tenCV}%`);
        }
        if (filter.trangThai) {
            sql += params.length ? " AND" : " WHERE";
            sql += " trangThai = ?";
            params.push(filter.trangThai);
        }
        if (filter.duAn) {
            sql += params.length ? " AND" : " WHERE";
            sql += " duAn = ?";
            params.push(filter.duAn);
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
            "SELECT * FROM CongViec WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const task = this.extractTaskData(payload);
        let sql = "UPDATE CongViec SET ";
        const fields = [];
        const params = [];
        for (const key in task) {
            fields.push(`${key} = ?`);
            params.push(task[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...task };
    }

    async delete(id) {
        await this.mysql.execute("DELETE FROM CongViec WHERE id = ?", [id]);
        return id;
    }

    async deleteAll() {
        await this.mysql.execute("DELETE FROM CongViec");
        return true;
    }
}

module.exports = TaskService;