class NoficationService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async create(payload) {
        const [result] = await this.mysql.execute(
            "INSERT INTO ThongBao (id, tieuDe, noiDung, nguoiDang, ngayDang, duAn) VALUES (?, ?, ?, ?, ?, ?)",
            [
                payload.id,
                payload.tieuDe,
                payload.noiDung,
                payload.nguoiDang,
                payload.ngayDang,
                payload.duAn,
            ]
        );
        return { ...payload };
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM ThongBao";
        let params = [];
        if (filter.tieuDe) {
            sql += " WHERE tieuDe LIKE ?";
            params.push(`%${filter.tieuDe}%`);
        }
        if (filter.nguoiDang) {
            sql += params.length ? " AND" : " WHERE";
            sql += " nguoiDang = ?";
            params.push(filter.nguoiDang);
        }
        if (filter.duAn) {
            sql += params.length ? " AND" : " WHERE";
            sql += " duAn = ?";
            params.push(filter.duAn);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM ThongBao WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const update = this.extractNoficationData(payload);
        let sql = "UPDATE ThongBao SET ";
        const fields = [];
        const params = [];
        for (const key in update) {
            fields.push(`${key} = ?`);
            params.push(update[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...update };
    }

    async delete(id) {
        await this.mysql.execute("DELETE FROM ThongBao WHERE id = ?", [id]);
        return { id };
    }
    
    async deleteAll() {
        await this.mysql.execute("DELETE FROM ThongBao");
        return { message: "All notifications deleted" };
    }
}

module.exports = NoficationService;