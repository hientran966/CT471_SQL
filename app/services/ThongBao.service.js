class NotificationService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    extractNotificationData(payload) {
        return {
            tieuDe: payload.tieuDe ?? null,
            noiDung: payload.noiDung,
            idNguoiDang: payload.idNguoiDang,
            ngayDang: payload.ngayDang ?? new Date(),
            deactive: payload.deactive ?? null,
            idPhanCong: payload.idPhanCong ?? null,
            idCongViec: payload.idCongViec ?? null,
            idDuAn: payload.idDuAn ?? null,
            idPhanHoi: payload.idPhanHoi ?? null,
            idPhienBan: payload.idPhienBan ?? null,
            idNguoiNhan: payload.idNguoiNhan ?? null,
        };
    }

    async create(payload) {
        const notification = this.extractNotificationData(payload);
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();

            const [rows] = await connection.execute(
                "SELECT id FROM ThongBao WHERE id LIKE 'TB%%%%%%' ORDER BY id DESC LIMIT 1 FOR UPDATE"
            );

            let newIdNumber = 1;
            if (rows.length > 0) {
                const lastId = rows[0].id;
                const num = parseInt(lastId.slice(2), 10);
                if (!isNaN(num)) newIdNumber = num + 1;
            }

            const newId = "TB" + newIdNumber.toString().padStart(6, "0");
            notification.id = newId;

            const values = [
                notification.id,
                notification.tieuDe ?? null,
                notification.noiDung ?? null,
                notification.idNguoiDang ?? null,
                notification.ngayDang ?? new Date(),
                notification.deactive ?? null,
                notification.idPhanCong ?? null,
                notification.idCongViec ?? null,
                notification.idDuAn ?? null,
                notification.idPhanHoi ?? null,
                notification.idPhienBan ?? null,
                notification.idNguoiNhan ?? null
            ];

            await connection.execute(
                `INSERT INTO ThongBao 
                (id, tieuDe, noiDung, idNguoiDang, ngayDang, deactive, idPhanCong, idCongViec, idDuAn, idPhanHoi, idPhienBan, idNguoiNhan) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                values
            );

            await connection.commit();
            return { ...notification };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async find(filter = {}, { page = 1, pageSize = 20 } = {}) {
        let sql = "FROM ThongBao WHERE deactive IS NULL";
        const params = [];

        if (filter.tieuDe) {
            sql += " AND tieuDe LIKE ?";
            params.push(`%${filter.tieuDe}%`);
        }

        if (filter.idNguoiDang) {
            sql += " AND idNguoiDang = ?";
            params.push(filter.idNguoiDang);
        }

        if (filter.idDuAn) {
            sql += " AND idDuAn = ?";
            params.push(filter.idDuAn);
        }

        const [data] = await this.mysql.execute(
            `SELECT * ${sql} ORDER BY ngayDang DESC LIMIT ? OFFSET ?`,
            [...params, pageSize, (page - 1) * pageSize]
        );

        const [countResult] = await this.mysql.execute(
            `SELECT COUNT(*) as total ${sql}`,
            params
        );

        return {
            data,
            total: countResult[0].total,
            page,
            pageSize,
        };
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM ThongBao WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const notification = this.extractNotificationData(payload);
        const fields = [];
        const params = [];

        for (const [key, value] of Object.entries(notification)) {
            if (key === "id" || value === undefined) continue;
            fields.push(`${key} = ?`);
            params.push(value);
        }

        if (fields.length === 0) return null;

        const sql = `UPDATE ThongBao SET ${fields.join(", ")} WHERE id = ?`;
        params.push(id);
        await this.mysql.execute(sql, params);
        return { id, ...payload };
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
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute("UPDATE ThongBao SET deactive = ?", [deleteAt]);
            await connection.commit();
            return true;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    getNotificationByTaskId(taskId) {
        return this.mysql.execute(
            "SELECT * FROM ThongBao WHERE idCongViec = ? AND deactive IS NULL",
            [taskId]
        ).then(([rows]) => rows);
    }

    getNotificationByProjectId(projectId) {
        return this.mysql.execute(
            "SELECT * FROM ThongBao WHERE idDuAn = ? AND deactive IS NULL",
            [projectId]
        ).then(([rows]) => rows);
    }

    getNotificationByAssignmentId(assignmentId) {
        return this.mysql.execute(
            "SELECT * FROM ThongBao WHERE idPhanCong = ? AND deactive IS NULL",
            [assignmentId]
        ).then(([rows]) => rows);
    }

    getNotificationByCommentId(commentId) {
        return this.mysql.execute(
            "SELECT * FROM ThongBao WHERE idPhanHoi = ? AND deactive IS NULL",
            [commentId]
        ).then(([rows]) => rows);
    }

    getNotificationByVersionId(versionId) {
        return this.mysql.execute(
            "SELECT * FROM ThongBao WHERE idPhienBan = ? AND deactive IS NULL",
            [versionId]
        ).then(([rows]) => rows);
    }

    getNotificationByUserId(userId) {
        return this.mysql.execute(
            "SELECT * FROM ThongBao WHERE idNguoiDang = ? AND deactive IS NULL ORDER BY ngayDang DESC",
            [userId]
        ).then(([rows]) => rows);
    }

    getNotificationByReceive(id) {
        return this.mysql.execute(
            "SELECT * FROM ThongBao WHERE idNguoiNhan = ? AND deactive IS NULL ORDER BY ngayDang DESC",
            [id]
        ).then(([rows]) => rows);
    }
}

module.exports = NotificationService;