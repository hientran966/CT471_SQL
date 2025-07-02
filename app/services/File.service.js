const fs = require('fs');
const path = require('path');

class FileService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractFileData(payload) {
        return {
            tenFile: payload.tenFile ?? null,
            idNguoiTao: payload.idNguoiTao ?? null,
            idCongViec: payload.idCongViec ?? null,
            idPhanCong: payload.idPhanCong ?? null,
            idDuAn: payload.idDuAn ?? null,
            deactive: payload.deactive ?? null,
        };
    }

    async extractVersionData(payload) {
        return {
            ngayUpload: payload.ngayUpload ?? new Date(),
            deactive: payload.deactive ?? null,
            trangThai: payload.trangThai ?? "Chờ duyệt",
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
        const file = await this.extractFileData(payload);
        const version = await this.extractVersionData(payload);

        if (!payload.tenFile || typeof payload.tenFile !== 'string') {
            throw new Error("Tên file không hợp lệ.");
        }

        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();

            // Lưu file vật lý
            let duongDan = null;
            if (payload.fileDataBase64 && payload.tenFile) {
                duongDan = await this.saveFileFromPayload(payload);
            }
            version.duongDan = duongDan;

            // B1: Tạo bản ghi File (chưa có id)
            const [fileResult] = await connection.execute(
                "INSERT INTO File (tenFile, idNguoiTao, idCongViec, idPhanCong, idDuAn) VALUES (?, ?, ?, ?, ?)",
                [file.tenFile, file.idNguoiTao, file.idCongViec, file.idPhanCong, file.idDuAn]
            );
            const fileAutoId = fileResult.insertId;
            const fileId = "FI" + fileAutoId.toString().padStart(6, "0");
            file.id = fileId;

            await connection.execute(
                "UPDATE File SET id = ? WHERE autoId = ?",
                [fileId, fileAutoId]
            );

            // B2: Tạo phiên bản đầu tiên
            const [verCountRows] = await connection.execute(
                "SELECT COUNT(*) as count FROM PhienBan WHERE idFile = ? AND deactive IS NULL",
                [fileId]
            );
            version.soPB = verCountRows[0].count + 1;

            const [verResult] = await connection.execute(
                "INSERT INTO PhienBan (soPB, duongDan, ngayUpload, trangThai, deactive, idFile) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    version.soPB,
                    version.duongDan,
                    version.ngayUpload,
                    version.trangThai,
                    version.deactive,
                    fileId
                ]
            );
            const verAutoId = verResult.insertId;
            const versionId = "PB" + verAutoId.toString().padStart(6, "0");
            version.id = versionId;

            await connection.execute(
                "UPDATE PhienBan SET id = ? WHERE autoId = ?",
                [versionId, verAutoId]
            );

            await connection.commit();
            return { ...file, duongDan: version.duongDan, idFile: fileId, idVersion: versionId };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
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
        if (filter.idPhanCong) {
            sql += " AND idPhanCong = ?";
            params.push(filter.idPhanCong);
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
        if (!payload) throw new Error("Thiếu payload khi thêm phiên bản file.");

        let duongDan = null;
        if (payload.fileDataBase64 && payload.tenFile) {
            duongDan = await this.saveFileFromPayload(payload);
        }

        const version = await this.extractVersionData(payload);
        version.duongDan = duongDan;

        const [verCountRows] = await this.mysql.execute(
            "SELECT COUNT(*) as count FROM PhienBan WHERE idFile = ? AND deactive IS NULL",
            [id]
        );
        version.soPB = verCountRows[0].count + 1;

        const [verResult] = await this.mysql.execute(
            "INSERT INTO PhienBan (soPB, duongDan, ngayUpload, trangThai, deactive, idFile) VALUES (?, ?, ?, ?, ?, ?)",
            [
                version.soPB,
                version.duongDan,
                version.ngayUpload,
                version.trangThai,
                version.deactive,
                id
            ]
        );
        const verAutoId = verResult.insertId;
        version.id = "PB" + verAutoId.toString().padStart(6, "0");

        await this.mysql.execute(
            "UPDATE PhienBan SET id = ? WHERE autoId = ?",
            [version.id, verAutoId]
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

    async approve(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM PhienBan WHERE id = ? AND deactive IS NULL",
            [id]
        );
        if (rows.length === 0) {
            throw new Error("Phiên bản không tồn tại hoặc đã bị xóa.");
        }
        const version = rows[0];
        if (version.trangThai !== "Chờ duyệt") {
            throw new Error("Phiên bản đã được duyệt hoặc không cần duyệt.");
        }
        await this.mysql.execute(
            "UPDATE PhienBan SET trangThai = 'Đã duyệt' WHERE id = ?",
            [id]
        );
        return { ...version, trangThai: 'Đã duyệt' };
    }

    async updateAvatar(idNguoiDung, payload) {
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();

            // Tạo bản ghi file
            const file = await this.extractFileData(payload);
            const version = await this.extractVersionData(payload);

            if (!payload.tenFile || typeof payload.tenFile !== 'string') {
                throw new Error("Tên file không hợp lệ.");
            }

            let duongDan = null;
            if (payload.fileDataBase64 && payload.tenFile) {
                duongDan = await this.saveFileFromPayload(payload);
            }
            version.duongDan = duongDan;

            const [fileResult] = await connection.execute(
                "INSERT INTO File (tenFile, idNguoiTao) VALUES (?, ?)",
                [file.tenFile, idNguoiDung]
            );
            const fileAutoId = fileResult.insertId;
            const fileId = "FI" + fileAutoId.toString().padStart(6, "0");

            await connection.execute(
                "UPDATE File SET id = ? WHERE autoId = ?",
                [fileId, fileAutoId]
            );

            // Thêm phiên bản
            version.soPB = 1;
            const [verResult] = await connection.execute(
                "INSERT INTO PhienBan (soPB, duongDan, ngayUpload, trangThai, idFile) VALUES (?, ?, ?, ?, ?)",
                [version.soPB, version.duongDan, version.ngayUpload, version.trangThai, fileId]
            );
            const verAutoId = verResult.insertId;
            const versionId = "PB" + verAutoId.toString().padStart(6, "0");

            await connection.execute(
                "UPDATE PhienBan SET id = ? WHERE autoId = ?",
                [versionId, verAutoId]
            );

            // Cập nhật avatar cho tài khoản
            await connection.execute(
                "UPDATE TaiKhoan SET avatar = ? WHERE id = ?",
                [fileId, idNguoiDung]
            );

            await connection.commit();
            return { fileId, versionId };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = FileService;