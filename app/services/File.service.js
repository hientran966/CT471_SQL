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
            idNguoiTao: payload.idNguoiTao ?? null,
            idCongViec: payload.idCongViec ?? null,
            deactive: payload.deactive ?? null,
        };
    }

    async extractVersionData(payload) {
        return {
            id: payload.id,
            soPB: payload.soPB ?? null,
            ngayUpload: payload.ngayUpload ?? null,
            deactive: payload.deactive ?? null,
            idFile: payload.idFile ?? null,
        };
    }

    // Lưu file từ payload chứa base64 với tên duy nhất
    async saveFileFromPayload(payload) {
        const { tenFile, fileDataBase64 } = payload;
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        // Tạo tên file duy nhất
        const ext = path.extname(tenFile);
        const baseName = path.basename(tenFile, ext);
        const uniqueName = `${baseName}_${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, uniqueName);
        fs.writeFileSync(filePath, Buffer.from(fileDataBase64, 'base64'));
        return path.join('uploads', uniqueName);
    }

    async create(payload) {
        // Kiểm tra payload hợp lệ
        if (!payload || !payload.id || !payload.tenFile || !payload.idNguoiTao) {
            throw new Error("Thiếu thông tin bắt buộc khi tạo file.");
        }

        // Nếu có file base64 thì lưu file vật lý trước
        let duongDan = null;
        if (payload.fileDataBase64 && payload.tenFile) {
            duongDan = await this.saveFileFromPayload(payload);
        }

        const file = await this.extractFileData(payload);
        const version = await this.extractVersionData(payload);
        version.duongDan = duongDan || null;

        // Tạo file
        const [fileResult] = await this.mysql.execute(
            "INSERT INTO File (id, tenFile, idNguoiTao, idCongViec) VALUES (?, ?, ?, ?)",
            [
                file.id,
                file.tenFile,
                file.idNguoiTao,
                file.idCongViec,
            ]
        );

        // Tạo phiên bản đầu tiên cho file
        const [verResult] = await this.mysql.execute(
            "INSERT INTO PhienBan (id, soPB, duongDan, ngayUpload, deactive, idFile) VALUES (?, ?, ?, ?, ?, ?)",
            [
                version.id,
                version.soPB,
                version.duongDan,
                version.ngayUpload,
                version.deactive,
                file.id,
            ]
        );

        return {
            ...file,
            version: {
                ...version,
                idFile: file.id
            }
        };
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM File WHERE deactive IS NULL";
        let params = [];
        if (filter.tenFile) {
            sql += " AND tenFile LIKE ?";
            params.push(`%${filter.tenFile}%`);
        }
        if (filter.idNguoiTao) {
            sql += " AND idNguoiTao = ?";
            params.push(filter.idNguoiTao);
        }
        if (filter.idCongViec) {
            sql += " AND idCongViec = ?";
            params.push(filter.idCongViec);
        }
        const [rows] = await this.mysql.execute(sql, params);
        return rows;
    }

    async findById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM File WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async findVersion(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM PhienBan WHERE idFile = ? AND deactive IS NULL",
            [id]
        );
        return rows || null;
    }

    async findVersionById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM PhienBan WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async update(id, payload) {
        const file = await this.extractFileData(payload);
        let sql = "UPDATE File SET ";
        const fields = [];
        const params = [];
        for (const key in file) {
            if (key === 'id') continue;
            fields.push(`${key} = ?`);
            params.push(file[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...file };
    }

    async addVersion(id, payload) {
        // Kiểm tra id và payload hợp lệ
        if (!id || !payload) {
            throw new Error("Thiếu id hoặc payload khi thêm phiên bản file.");
        }
        // Nếu có file base64 thì lưu file vật lý trước
        let duongDan = null;
        if (payload.fileDataBase64 && payload.tenFile) {
            duongDan = await this.saveFileFromPayload(payload);
        }
        const version = await this.extractVersionData(payload);
        if (duongDan) version.duongDan = duongDan;
        const [result] = await this.mysql.execute(
            "INSERT INTO PhienBan (id, soPB, duongDan, ngayUpload, deactive, idFile) VALUES (?, ?, ?, ?, ?, ?)",
            [
                version.id,
                version.soPB,
                version.duongDan,
                version.ngayUpload,
                version.deactive,
                id,
            ]
        );
        return { ...version, idFile: id };
    }

    async updateVersion(id, payload) {
        const version = await this.extractVersionData(payload);
        let sql = "UPDATE PhienBan SET ";
        const fields = [];
        const params = [];
        for (const key in version) {
            if (key === 'id') continue;
            fields.push(`${key} = ?`);
            params.push(version[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...version };
    }

    async delete(id) {
        const deleteAt = new Date();
        await this.mysql.execute(
            "UPDATE File SET deactive = ? WHERE id = ?",
            [deleteAt, id]
        );
        return id;
    }

    async restore(id) {
        const [result] = await this.mysql.execute(
            "UPDATE File SET deactive = NULL WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async deleteAll() {
        const deleteAt = new Date();
        await this.mysql.execute(
            "UPDATE File SET deactive = ?",
            [deleteAt]
        );
        return deleteAt;
    }
}

module.exports = FileService;