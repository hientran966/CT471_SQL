class TaskGroupService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractTaskGroupData(payload) {
        return {
            tenNhom: payload.tenNhom,
            deactive: payload.deactive ?? null,
            idDuAn: payload.idDuAn,
            idNguoiTao: payload.idNguoiTao,
        };
    }

    async create(payload) {
        const taskGroup = await this.extractTaskGroupData(payload);
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction(); // Bắt đầu Transaction
            const [rows] = await connection.execute("SELECT id FROM NhomCongViec WHERE id LIKE 'NH%%%%%%' ORDER BY id DESC LIMIT 1");
            let newIdNumber = 1;
            if (rows.length > 0) {
                const lastId = rows[0].id;
                const num = parseInt(lastId.slice(2), 10);
                if (!isNaN(num)) newIdNumber = num + 1;
            }
            const newId = "NH" + newIdNumber.toString().padStart(6, "0");
            taskGroup.id = newId;

            await connection.execute(
                "INSERT INTO NhomCongViec (id, tenNhom, deactive, idDuAn, idNguoiTao) VALUES (?, ?, ?, ?, ?)",
                [
                    taskGroup.id,
                    taskGroup.tenNhom,
                    taskGroup.deactive,
                    taskGroup.idDuAn,
                    taskGroup.idNguoiTao,
                ]
            );
            await connection.commit(); // Commit Transaction
            return { ...taskGroup };
        } catch (error) {
            await connection.rollback(); // Rollback Transaction
            throw error; // Ném lại lỗi để xử lý ở nơi khác
        } finally {
            connection.release(); // Giải phóng kết nối
        }
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM NhomCongViec WHERE deactive IS NULL";
        let params = [];
        if (filter.tenNhom) {
            sql += " AND tenNhom LIKE ?";
            params.push(`%${filter.tenNhom}%`);
        }
        if (filter.idDuAn) {
            sql += " AND idDuAn = ?";
            params.push(filter.idDuAn);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM NhomCongViec WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const taskGroup = await this.extractTaskGroupData(payload);
        let sql = "UPDATE NhomCongViec SET ";
        const fields = [];
        const params = [];
        for (const key in taskGroup) {
            if (key === "id") continue;
            fields.push(`${key} = ?`);
            params.push(taskGroup[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...taskGroup };
    }

    async delete(id) {
        const [result] = await this.mysql.execute(
            "UPDATE NhomCongViec SET deactive = NOW() WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async restore(id) {
        const [result] = await this.mysql.execute(
            "UPDATE NhomCongViec SET deactive = NULL WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async deleteAll() {
        const deletedAt = new Date();
        await this.mysql.execute(
            "UPDATE NhomCongViec SET deactive = ? WHERE deactive IS NULL",
            [deletedAt]
        );
        return deletedAt;
    }
}

module.exports = TaskGroupService;