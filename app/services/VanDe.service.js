class CommentService {
        constructor(mysql) {
        this.mysql = mysql;
    }

    async extractCommentData(payload) {
        return {
            id: payload.id,
            moTa: payload.moTa,
            nguoiDang: payload.nguoiDang,
            ngayDang: payload.ngayDang,
            file: payload.file,
        };
    }

    async create(payload) {
        const comment = await this.extractCommentData(payload);
        const [result] = await this.mysql.execute(
            "INSERT INTO VanDe (id, moTa, nguoiDang, ngayDang, file) VALUES (?, ?, ?, ?, ?)",
            [
                comment.id,
                comment.moTa,
                comment.nguoiDang,
                comment.ngayDang,
                comment.file,
            ]
        );
        return { ...comment };
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM VanDe";
        let params = [];
        if (filter.moTa) {
            sql += " WHERE moTa LIKE ?";
            params.push(`%${filter.moTa}%`);
        }
        if (filter.nguoiDang) {
            sql += params.length ? " AND" : " WHERE";
            sql += " nguoiDang = ?";
            params.push(filter.nguoiDang);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM VanDe WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const comment = this.extractCommentData(payload);
        let sql = "UPDATE VanDe SET ";
        const fields = [];
        const params = [];
        for (const key in comment) {
            fields.push(`${key} = ?`);
            params.push(comment[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...comment };
    }

    async delete(id) {
        await this.mysql.execute("DELETE FROM VanDe WHERE id = ?", [id]);
        return id;
    }

    async deleteAll() {
        await this.mysql.execute("DELETE FROM VanDe");
        return true;
    }
}

module.exports = CommentService;