const fs = require('fs');
const path = require('path');

class FileService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractFileData(payload) {
        return {
            id: payload.id,
            tenFile: payload.tenFile ?? null,
            nguoiTao: payload.nguoiTao ?? null,
            duAn: payload.duAn ?? null,
            ngayUpload: payload.ngayUpload ?? new Date(),
            soPB: payload.soPB ?? 0,
        };
    }

    // Lưu file từ payload chứa base64
    async saveFileFromPayload(payload) {
        const { tenFile, fileDataBase64 } = payload;
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, tenFile);
        fs.writeFileSync(filePath, Buffer.from(fileDataBase64, 'base64'));
        return path.join('uploads', tenFile);
    }

    async create(payload) {
        // Nếu có file base64 thì lưu file vật lý trước
        let duongDan = null;
        if (payload.fileDataBase64 && payload.tenFile) {
            duongDan = await this.saveFileFromPayload(payload);
        }
        const file = await this.extractFileData(payload);
        file.duongDan = duongDan; // Gán đường dẫn file
        const [result] = await this.mysql.execute(
            "INSERT INTO File (id, tenFile, nguoiTao, duAn, ngayUpload, duongDan, soPB) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                file.id,
                file.tenFile,
                file.nguoiTao,
                file.duAn,
                file.ngayUpload,
                file.duongDan,
                file.soPB,
            ]
        );
        return { ...file };
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM File";
        let params = [];
        if (filter.tenFile) {
            sql += " WHERE tenFile LIKE ?";
            params.push(`%${filter.tenFile}%`);
        }
        if (filter.nguoiTao) {
            sql += params.length ? " AND" : " WHERE";
            sql += " nguoiTao = ?";
            params.push(filter.nguoiTao);
        }
        if (filter.duAn) {
            sql += params.length ? " AND" : " WHERE";
            sql += " duAn = ?";
            params.push(filter.duAn);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM File WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        // Nếu có file base64 thì lưu file vật lý trước
        let duongDan = null;
        if (payload.fileDataBase64 && payload.tenFile) {
            duongDan = await this.saveFileFromPayload(payload);
        }
        const file = this.extractFileData(payload);
        if (duongDan) file.duongDan = duongDan;
        let sql = "UPDATE File SET ";
        const fields = [];
        const params = [];
        for (const key in file) {
            fields.push(`${key} = ?`);
            params.push(file[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...file };
    }

    async delete(id) {
        // Xóa file vật lý nếu cần
        const file = await this.findById(id);
        if (file && file.tenFile) {
            const filePath = path.join(__dirname, '../../uploads', file.tenFile);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        await this.mysql.execute("DELETE FROM File WHERE id = ?", [id]);
        return id;
    }

    async deleteAll() {
        // Xóa tất cả file vật lý trong thư mục uploads
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (fs.existsSync(uploadsDir)) {
            fs.readdirSync(uploadsDir).forEach(file => {
                fs.unlinkSync(path.join(uploadsDir, file));
            });
        }
        await this.mysql.execute("DELETE FROM File");
        return true;
    }
}

module.exports = FileService;