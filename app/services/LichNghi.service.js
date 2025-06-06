const { create } = require("../controllers/CongViec.controller");

class CalendarService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractCalendarData(payload) {
        return {
            tieuDe: payload.tieuDe,
            ngayBD: payload.ngayBD,
            ngayKT: payload.ngayKT,
            deactive: payload.deactive ?? null,
            ngayBDBu: payload.ngayBDBu,
            ngayKTBu: payload.ngayKTBu,
        };
    }

    async create(payload) {
        const calendar = await this.extractCalendarData(payload);
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();
            const [rows] = await connection.execute("SELECT id FROM LichNghi WHERE id LIKE 'LN%%%%%%' ORDER BY id DESC LIMIT 1");
            let newIdNumber = 1;
            if (rows.length > 0) {
                const lastId = rows[0].id;
                const num = parseInt(lastId.slice(2), 10);
                if (!isNaN(num)) newIdNumber = num + 1;
            }
            const newId = "LN" + newIdNumber.toString().padStart(6, "0");
            calendar.id = newId;

            calendar.idNgayBu = null;
            if (calendar.ngayBDBu && calendar.ngayKTBu) {
                calendar.idNgayBu = await this.createDate({
                    ngayBDBu: calendar.ngayBDBu,
                    ngayKTBu: calendar.ngayKTBu
                });
            }
            await connection.execute(
                "INSERT INTO LichNghi (id, tieuDe, ngayBD, ngayKT, deactive, idNgayBu) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    calendar.id,
                    calendar.tieuDe,
                    calendar.ngayBD,
                    calendar.ngayKT,
                    calendar.deactive,
                    calendar.idNgayBu,
                ]
            );
            await connection.commit();
            return { ...calendar };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async createDate(payload) {
        const calendar = await this.extractCalendarData(payload);
        const [rows] = await this.mysql.execute("SELECT id FROM NgayBu WHERE id LIKE 'NB%%%%%%' ORDER BY id DESC LIMIT 1");
        let newIdNumber = 1;
        if (rows.length > 0) {
            const lastId = rows[0].id;
            const num = parseInt(lastId.slice(2), 10);
            if (!isNaN(num)) newIdNumber = num + 1;
        }
        const newId = "NB" + newIdNumber.toString().padStart(6, "0");
        calendar.id = newId;

        await this.mysql.execute(
            "INSERT INTO NgayBu (id, ngayBD, ngayKT) VALUES (?, ?, ?)",
            [
                calendar.id,
                calendar.ngayBDBu,
                calendar.ngayKTBu,
            ]
        );

        return calendar.id;
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM LichNghi WHERE deactive IS NULL";
        let params = [];
        if (filter.tieuDe) {
            sql += " AND tieuDe LIKE ?";
            params.push(`%${filter.tieuDe}%`);
        }
        if (filter.ngayBD) {
            sql += " AND ngayBD >= ?";
            params.push(filter.ngayBD);
        }
        if (filter.ngayKT) {
            sql += " AND ngayKT <= ?";
            params.push(filter.ngayKT);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }
    
    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM LichNghi WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const calendar = await this.extractCalendarData(payload);
        let sql = "UPDATE LichNghi SET ";
        const fields = [];
        const params = [];
        for (const key in calendar) {
            if (key === "id") continue;
            fields.push(`${key} = ?`);
            params.push(calendar[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        const [result] = await this.mysql.execute(sql, params);
        if (result.affectedRows === 0) {
            throw new Error("LichNghi not found");
        }
        return { id: calendar.id, tieuDe: calendar.tieuDe };
    }

    async delete(id) {
        const [result] = await this.mysql.execute(
            "UPDATE LichNghi SET deactive = NOW() WHERE id = ?",
            [id]
        );
        if (result.affectedRows === 0) {
            throw new Error("LichNghi not found");
        }
        return { id };
    }

    async restore(id) {
        const [result] = await this.mysql.execute(
            "UPDATE LichNghi SET deactive = NULL WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async deleteAll() {
        const deletedAt = new Date();
        await this.mysql.execute(
            "UPDATE LichNghi SET deactive = ?",
            [deletedAt]
        );
        return deletedAt;
    }

    async getNgayBu(idNgayBu) {
        if (!idNgayBu) return null;
        const [rows] = await this.mysql.execute(
            "SELECT ngayBD, ngayKT FROM NgayBu WHERE id = ?",
            [idNgayBu]
        );
        return rows[0] || null;
    }
}

module.exports = CalendarService;