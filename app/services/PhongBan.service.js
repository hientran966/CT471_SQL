class DepartmentService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractDepartmentData(payload) {
        return {
            tenPhong: payload.tenPhong,
            loaiPhongBan: payload.loaiPhongBan ?? "Thấp",
            deactive: payload.deactive ?? null,
        };
    }

    async create(payload) {
        const department = await this.extractDepartmentData(payload);
        const connection = await this.mysql.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.execute(
                "INSERT INTO PhongBan (tenPhong, loaiPhongBan, deactive) VALUES (?, ?, ?)",
                [department.tenPhong, department.loaiPhongBan, department.deactive]
            );

            const autoId = result.insertId;
            const newId = "PH" + autoId.toString().padStart(6, "0");
            await connection.execute(
                "UPDATE PhongBan SET id = ? WHERE autoId = ?",
                [newId, autoId]
            );

            await connection.commit();
            return { id: newId, ...department };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async find(filter = {}) {
        let sql = `
            SELECT pb.*, lp.phanQuyen
            FROM PhongBan pb
            JOIN LoaiPhongBan lp ON pb.loaiPhongBan = lp.id
            WHERE pb.deactive IS NULL
        `;
        const params = [];

        if (filter.tenPhong) {
            sql += " AND pb.tenPhong LIKE ?";
            params.push(`%${filter.tenPhong}%`);
        }

        if (filter.loaiPhongBan) {
            sql += " AND pb.loaiPhongBan = ?";
            params.push(filter.loaiPhongBan);
        }

        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            `
            SELECT pb.*, lp.phanQuyen
            FROM PhongBan pb
            JOIN LoaiPhongBan lp ON pb.loaiPhongBan = lp.id
            WHERE pb.id = ? AND pb.deactive IS NULL
            `,
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const department = await this.extractDepartmentData(payload);
        let sql = "UPDATE PhongBan SET ";
        const fields = [];
        const params = [];
        for (const key in department) {
            if (key === "id") continue;
            fields.push(`${key} = ?`);
            params.push(department[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { id: department.id, tenPhong: department.tenPhong };
    }

    async delete(id) {
        const deletedAt = new Date();
        await this.mysql.execute(
            "UPDATE PhongBan SET deactive = ? WHERE id = ?",
            [deletedAt, id]
        );
        return id;
    }

    async restore(id) {
        const [result] = await this.mysql.execute(
            "UPDATE PhongBan SET deactive = NULL WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async deleteAll() {
        const deletedAt = new Date();
        await this.mysql.execute(
            "UPDATE PhongBan SET deactive = ? WHERE deactive IS NULL",
            [deletedAt]
        );
        return true;
    }

    async getRole(id) {
        const [rows] = await this.mysql.execute(
            "SELECT lp.phanQuyen FROM PhongBan pb JOIN LoaiPhongBan lp ON pb.loaiPhongBan = lp.id WHERE pb.id = ? AND pb.deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }
}

module.exports = DepartmentService;