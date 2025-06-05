class ProjectService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractProjectData(payload) {
        return {
            tenDA: payload.tenDA ?? null,
            ngayBD: payload.ngayBD ?? null,
            ngayKT: payload.ngayKT ?? null,
            trangThai: payload.trangThai ?? "Chưa bắt đầu",
            deactive: payload.deactive ?? null,
            idNguoiTao: payload.idNguoiTao ?? null,
        };
    }

    async create(payload) {
        const project = await this.extractProjectData(payload);
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction(); // Bắt đầu Transaction
            const [rows] = await connection.execute("SELECT id FROM DuAn WHERE id LIKE 'DA%%%%%%' ORDER BY id DESC LIMIT 1");
            let newIdNumber = 1;
            if (rows.length > 0) {
                const lastId = rows[0].id;
                const num = parseInt(lastId.slice(2), 10);
                if (!isNaN(num)) newIdNumber = num + 1;
            }
            const newId = "DA" + newIdNumber.toString().padStart(6, "0");
            project.id = newId;

            await connection.execute(
                "INSERT INTO DuAn (id, tenDA, ngayBD, ngayKT, deactive, trangThai, idNguoiTao) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    project.id,
                    project.tenDA,
                    project.ngayBD,
                    project.ngayKT,
                    project.deactive,
                    project.trangThai,
                    project.idNguoiTao,
                ]
            );
            await connection.commit(); // Commit Transaction
            return { ...project };
        }
        catch (error) {
            await connection.rollback(); // Rollback Transaction
            throw error; // Ném lại lỗi để xử lý ở nơi khác
        } finally {
            connection.release(); // Giải phóng kết nối
        }
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM DuAn WHERE deactive IS NULL";
        let params = [];
        if (filter.tenDA) {
            sql += " AND tenDA LIKE ?";
            params.push(`%${filter.tenDA}%`);
        }
        if (filter.trangThai) {
            sql += " AND trangThai = ?";
            params.push(filter.trangThai);
        }
        if (filter.idNguoiTao) {
            sql += " AND idNguoiTao = ?";
            params.push(filter.idNguoiTao);
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
            "SELECT * FROM DuAn WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const fields = [];
        const params = [];

        for (const key in payload) {
            if (key === "id") continue;
            fields.push(`${key} = ?`);
            params.push(payload[key]);
        }

        if (fields.length === 0) {
            throw new Error("Không có trường nào để cập nhật.");
        }

        const sql = `UPDATE DuAn SET ${fields.join(", ")} WHERE id = ?`;
        params.push(id);

        await this.mysql.execute(sql, params);
        return this.findById(id);
    }

    async delete(id) {
        const deletedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await this.mysql.execute(
            "UPDATE DuAn SET deactive = ? WHERE id = ?",
            [deletedDate, id]
        );
        return id;
    }

    async restore(id) {
        const [result] = await this.mysql.execute(
            "UPDATE DuAn SET deactive = NULL WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async deleteAll() {
        const deletedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await this.mysql.execute(
            "UPDATE DuAn SET deactive = ? WHERE deactive IS NULL",
            [deletedDate]
        );
        return true;
    }
}

module.exports = ProjectService;