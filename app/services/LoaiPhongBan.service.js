class DeptRole {
    constructor(mysql) {
    this.mysql = mysql;
  }

    async extractDeptRoleData(payload) {
        return {
        loaiPhongBan: payload.loaiPhongBan,
        phanQuyen: payload.phanQuyen ?? 1,
        deactive: payload.deactive ?? null,
        };
    }   

    async create(payload) {
        const deptRole = await this.extractDeptRoleData(payload);
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.execute(
                "INSERT INTO LoaiPhongBan (loaiPhongBan, phanQuyen, deactive) VALUES (?, ?, ?)",
                [deptRole.loaiPhongBan, deptRole.phanQuyen, deptRole.deactive]
            );
            const autoId = result.insertId;
            const newId = "LP" + autoId.toString().padStart(6, "0");
            await connection.execute(
                "UPDATE LoaiPhongBan SET id = ? WHERE autoId = ?",
                [newId, autoId]
            );
            await connection.commit();
            return { id: newId, loaiPhongBan: deptRole.loaiPhongBan, phanQuyen: deptRole.phanQuyen };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM LoaiPhongBan WHERE deactive IS NULL";
        let params = [];
        if (filter.loaiPhongBan) {
            sql += " AND loaiPhongBan LIKE ?";
            params.push(`%${filter.loaiPhongBan}%`);
        }
        if (filter.phanQuyen) {
            sql += " AND phanQuyen = ?";
            params.push(filter.phanQuyen);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM LoaiPhongBan WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const update = await this.extractDeptRoleData(payload);
        let sql = "UPDATE LoaiPhongBan SET ";
        const fields = [];
        const params = [];
        for (const key in update) {
            if (key === "id") continue;
            fields.push(`${key} = ?`);
            params.push(update[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        const [result] = await this.mysql.execute(sql, params);
        return result.affectedRows > 0;
    }

    async delete(id) {
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.execute(
                "UPDATE LoaiPhongBan SET deactive = NOW() WHERE id = ?",
                [id]
            );
            if (result.affectedRows === 0) {
                throw new Error("Không tìm thấy loại phòng ban với ID đã cho");
            }
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteAll() {
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.execute(
                "UPDATE LoaiPhongBan SET deactive = NOW() WHERE deactive IS NULL"
            );
            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async restore(id) {
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.execute(
                "UPDATE LoaiPhongBan SET deactive = NULL WHERE id = ?",
                [id]
            );
            if (result.affectedRows === 0) {
                throw new Error("Không tìm thấy loại phòng ban với ID đã cho");
            }
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = DeptRole;