class RoleService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractRoleData(payload) {
        return {
            tenVaiTro: payload.tenVaiTro,
            phanQuyen: payload.phanQuyen ?? 1,
            deactive: payload.deactive ?? null,
        };
    }

    async create(payload) {
        const role = await this.extractRoleData(payload);
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.execute(
                "INSERT INTO VaiTro (tenVaiTro, phanQuyen, deactive) VALUES (?, ?, ?)",
                [role.tenVaiTro, role.phanQuyen, role.deactive]
            );
            const autoId = result.insertId;
            const newId = "VT" + autoId.toString().padStart(6, "0");
            await connection.execute(
                "UPDATE VaiTro SET id = ? WHERE autoId = ?",
                [newId, autoId]
            );
            await connection.commit();
            return { id: newId, tenVaiTro: role.tenVaiTro, phanQuyen: role.phanQuyen };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM VaiTro WHERE deactive IS NULL";
        let params = [];
        if (filter.tenVaiTro) {
            sql += " AND tenVaiTro LIKE ?";
            params.push(`%${filter.tenVaiTro}%`);
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
            "SELECT * FROM VaiTro WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const role = await this.extractRoleData(payload);
        let sql = "UPDATE VaiTro SET ";
        const fields = [];
        const params = [];
        for (const key in role) {
            if (key === "id") continue;
            fields.push(`${key} = ?`);
            params.push(role[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...role, id };
    }

    async delete(id) {
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute(
                "UPDATE VaiTro SET deactive = NOW() WHERE id = ?",
                [id]
            );
            await connection.commit();
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
            await connection.execute(
                "UPDATE VaiTro SET deactive = NULL WHERE id = ?",
                [id]
            );
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteAll() {
        const deletedAt = new Date();
        await this.mysql.execute(
            "UPDATE VaiTro SET deactive = ? WHERE deactive IS NULL",
            [deletedAt]
        );
        return deletedAt;
    }
}

module.exports = RoleService;