class NoficationService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractNoficationData(payload) {
        return {
            tieuDe: payload.tieuDe ?? null,
            noiDung: payload.noiDung,
            idNguoiDang: payload.idNguoiDang,
            ngayDang: payload.ngayDang ?? new Date(),
            deactive: payload.deactive ?? null,
            idPhanCong: payload.idPhanCong ?? null,
            idCongViec: payload.idCongViec ?? null,
            idNhomCV: payload.idNhomCV ?? null,
            idDuAn: payload.idDuAn ?? null,
            idPhanHoi: payload.idPhanHoi ?? null,
        };
    }

    async create(payload) {
        const nofication = await this.extractNoficationData(payload);
                
        const [rows] = await this.mysql.execute("SELECT id FROM ThongBao WHERE id LIKE 'TB%%%%%%' ORDER BY id DESC LIMIT 1");
        let newIdNumber = 1;
        if (rows.length > 0) {
            const lastId = rows[0].id;
            const num = parseInt(lastId.slice(2), 10);
            if (!isNaN(num)) newIdNumber = num + 1;
        }
        const newId = "TB" + newIdNumber.toString().padStart(6, "0");
        nofication.id = newId;

        const [result] = await this.mysql.execute(
            "INSERT INTO ThongBao (id, tieuDe, noiDung, idNguoiDang, ngayDang, deactive, idPhanCong, idCongViec, idNhomCV, idDuAn, idPhanHoi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                nofication.id,
                nofication.tieuDe,
                nofication.noiDung,
                nofication.idNguoiDang,
                nofication.ngayDang,
                nofication.deactive,
                nofication.idPhanCong,
                nofication.idCongViec,
                nofication.idNhomCV,
                nofication.idDuAn,
                nofication.idPhanHoi,
            ]
        );
        return { ...nofication };
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM ThongBao";
        let params = [];
        if (filter.tieuDe) {
            sql += " WHERE tieuDe LIKE ?";
            params.push(`%${filter.tieuDe}%`);
        }
        if (filter.idNguoiDang) {
            sql += params.length ? " AND" : " WHERE";
            sql += " idNguoiDang = ?";
            params.push(filter.idNguoiDang);
        }
        if (filter.idDuAn) {
            sql += params.length ? " AND" : " WHERE";
            sql += " idDuAn = ?";
            params.push(filter.idDuAn);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM ThongBao WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const nofication = this.extractNoficationData(payload);
        let sql = "UPDATE ThongBao SET ";
        const fields = [];
        const params = [];
        for (const key in nofication) {
            if (key === "id") continue;
            fields.push(`${key} = ?`);
            params.push(nofication[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...nofication };
    }
    
    async delete(id) {
        const deleteAt = new Date();
        await this.mysql.execute(
            "UPDATE ThongBao SET deactive = ? WHERE id = ?",
            [deleteAt, id]
        );
        return id;
    }

    async restore(id) {
        const [result] = await this.mysql.execute(
            "UPDATE ThongBao SET deactive = NULL WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async deleteAll() {
        const deleteAt = new Date();
        await this.mysql.execute(
            "UPDATE ThongBao SET deactive = ?",
            [deleteAt]
        );
        return true;
    }
}

module.exports = NoficationService;