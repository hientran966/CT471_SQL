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

            // Tạo ngày bù nếu có
            calendar.idNgayBu = null;
            if (calendar.ngayBDBu && calendar.ngayKTBu) {
                calendar.idNgayBu = await this.createDate({
                    ngayBDBu: calendar.ngayBDBu,
                    ngayKTBu: calendar.ngayKTBu
                }, connection);
            }

            const [result] = await connection.execute(
                "INSERT INTO LichNghi (tieuDe, ngayBD, ngayKT, deactive, idNgayBu) VALUES (?, ?, ?, ?, ?)",
                [
                    calendar.tieuDe,
                    calendar.ngayBD,
                    calendar.ngayKT,
                    calendar.deactive,
                    calendar.idNgayBu,
                ]
            );

            const autoId = result.insertId;
            const newId = "LN" + autoId.toString().padStart(6, "0");

            await connection.execute(
                "UPDATE LichNghi SET id = ? WHERE autoId = ?",
                [newId, autoId]
            );

            await connection.commit();
            return { id: newId, ...calendar };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async createDate(payload, connection = this.mysql) {
        const calendar = await this.extractCalendarData(payload);

        const [result] = await connection.execute(
            "INSERT INTO NgayBu (ngayBD, ngayKT) VALUES (?, ?)",
            [calendar.ngayBDBu, calendar.ngayKTBu]
        );

        const autoId = result.insertId;
        const newId = "NB" + autoId.toString().padStart(6, "0");

        await connection.execute(
            "UPDATE NgayBu SET id = ? WHERE autoId = ?",
            [newId, autoId]
        );

        return newId;
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