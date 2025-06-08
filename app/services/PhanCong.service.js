const FileService = require("./File.service"); 

class AssignmentService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractAssignmentData(payload) {
        const result = {};
        if (payload.moTa !== undefined) result.moTa = payload.moTa;
        if (payload.idCongViec !== undefined) result.idCongViec = payload.idCongViec;
        if (payload.tienDoCaNhan !== undefined) result.tienDoCaNhan = payload.tienDoCaNhan;
        if (payload.idNguoiNhan !== undefined) result.idNguoiNhan = payload.idNguoiNhan;
        result.ngayNhan = payload.ngayNhan ?? null;
        result.ngayHoanTat = payload.ngayHoanTat ?? null;
        result.trangThai = payload.trangThai ?? "Chưa bắt đầu";
        return result;
    }

    async extractTransferData(payload) {
        return {
            moTaChuyenGiao: payload.moTaChuyenGiao,
            idNguoiNhanMoi: payload.idNguoiNhanMoi,
            ngayNhanMoi: payload.ngayNhanMoi,
        };
    }

    extractReportData(payload) {
        return {
            moTa: payload.moTa ?? null,
            tienDoCaNhan: payload.tienDoCaNhan ?? null,
            trangThai: payload.trangThai ?? null,
            idNguoiGui: payload.idNguoiGui,
        };
    }

    async generateUniqueBaoCaoId(connection) {
        const [rows] = await connection.execute(
            "SELECT id FROM BaoCao WHERE id LIKE 'BC%%%%%%' ORDER BY id DESC LIMIT 1"
        );
        let num = 1;
        if (rows.length) {
            const last = parseInt(rows[0].id.slice(2), 10);
            if (!Number.isNaN(last)) num = last + 1;
        }
        return "BC" + num.toString().padStart(6, "0");
    }

    async create(payload) {
        const assignment = await this.extractAssignmentData(payload);
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction(); // Bắt đầu Transaction
            const [rows] = await connection.execute("SELECT id FROM PhanCong WHERE id LIKE 'PC%%%%%%' ORDER BY id DESC LIMIT 1");
            let newIdNumber = 1;
            if (rows.length > 0) {
                const lastId = rows[0].id;
                const num = parseInt(lastId.slice(2), 10);
                if (!isNaN(num)) newIdNumber = num + 1;
            }
            const newId = "PC" + newIdNumber.toString().padStart(6, "0");
            assignment.id = newId;

            await connection.execute(
                "INSERT INTO PhanCong (id, idCongViec, tienDoCaNhan, idNguoiNhan, ngayNhan, ngayHoanTat, trangThai, moTa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    assignment.id,
                    assignment.idCongViec,
                    assignment.tienDoCaNhan,
                    assignment.idNguoiNhan,
                    assignment.ngayNhan,
                    assignment.ngayHoanTat,
                    assignment.trangThai,
                    assignment.moTa,
                ]
            );
            await connection.commit(); // Commit Transaction
            return { ...assignment };
        } catch (error) {
            await connection.rollback(); // Rollback Transaction
            throw error; // Ném lại lỗi để xử lý ở nơi khác
        } finally {
            connection.release(); // Giải phóng kết nối
        }
    }

    async transfer(id, payload) {
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction(); // Bắt đầu Transaction

            const transfer = await this.extractTransferData(payload);

            const [transRows] = await connection.execute("SELECT id FROM LichSuChuyenGiao WHERE id LIKE 'CG%%%%%%' ORDER BY id DESC LIMIT 1");
            let newIdNumber = 1;
            if (transRows.length > 0) {
                const lastId = transRows[0].id;
                const num = parseInt(lastId.slice(2), 10);
                if (!isNaN(num)) newIdNumber = num + 1;
            }
            const newId = "CG" + newIdNumber.toString().padStart(6, "0");
            transfer.id = newId;

            // Lấy dữ liệu phân công cũ
            const [rows] = await connection.execute("SELECT * FROM PhanCong WHERE id = ?", [id]);
            if (rows.length === 0) {
                await connection.rollback();
                connection.release();
                return null;
            }
            const oldAssignment = rows[0];

            // Tạo bản ghi PhanCong mới với người nhận mới, ngày nhận mới
            const newAssignmentPayload = {
                moTa: oldAssignment.moTa,
                idCongViec: oldAssignment.idCongViec,
                tienDoCaNhan: oldAssignment.tienDoCaNhan,
                idNguoiNhan: payload.idNguoiNhanMoi,
                ngayNhan: payload.ngayNhanMoi,
                ngayHoanTat: null,
                trangThai: oldAssignment.trangThai,
            };

            // Tạo id mới cho PhanCong
            const [rowsPC] = await connection.execute("SELECT id FROM PhanCong WHERE id LIKE 'PC%%%%%%' ORDER BY id DESC LIMIT 1");
            let newPCIdNumber = 1;
            if (rowsPC.length > 0) {
                const lastPCId = rowsPC[0].id;
                const numPC = parseInt(lastPCId.slice(2), 10);
                if (!isNaN(numPC)) newPCIdNumber = numPC + 1;
            }
            const newPCId = "PC" + newPCIdNumber.toString().padStart(6, "0");
            newAssignmentPayload.id = newPCId;

            await connection.execute(
                "INSERT INTO PhanCong (id, idCongViec, tienDoCaNhan, idNguoiNhan, ngayNhan, ngayHoanTat, trangThai, moTa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    newAssignmentPayload.id,
                    newAssignmentPayload.idCongViec,
                    newAssignmentPayload.tienDoCaNhan,
                    newAssignmentPayload.idNguoiNhan,
                    newAssignmentPayload.ngayNhan,
                    newAssignmentPayload.ngayHoanTat,
                    newAssignmentPayload.trangThai,
                    newAssignmentPayload.moTa,
                ]
            );

            // Tạo bản ghi ChuyenGiao với idTruoc (id cũ), idSau (id mới)
            await connection.execute(
                "INSERT INTO LichSuChuyenGiao (id, idTruoc, idSau, moTa) VALUES (?, ?, ?, ?)",
                [transfer.id, id, newAssignmentPayload.id, transfer.moTaChuyenGiao]
            );

            // Cập nhật trạng thái PhanCong cũ thành "Đã chuyển giao" và ngày hoàn tất thành ngày hiện tại
            const currentDate = new Date();
            await connection.execute(
                "UPDATE PhanCong SET trangThai = ?, ngayHoanTat = ? WHERE id = ?",
                ["Đã chuyển giao", currentDate, id]
            );

            await connection.commit(); // Commit Transaction
            connection.release();

            return {
                oldAssignment,
                newAssignment: newAssignmentPayload
            };
        } catch (err) {
            await connection.rollback(); // Rollback Transaction
            connection.release();
            throw err;
        }
    }

    async find(filter = {}) {
        let sql = "SELECT * FROM PhanCong WHERE deactive IS NULL";
        let params = [];
        if (filter.trangThai) {
            sql += " AND trangThai = ?";
            params.push(filter.trangThai);
        }
        if (filter.idNguoiNhan) {
            sql += " AND idNguoiNhan = ?";
            params.push(filter.idNguoiNhan);
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
            "SELECT * FROM PhanCong WHERE id = ? AND deactive IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    async findByTask(taskId) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM PhanCong WHERE idCongViec = ? AND deactive IS NULL",
            [taskId]
        );
        return rows || null;
    }

    async findTransferHistory(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM LichSuChuyenGiao WHERE idTruoc = ? OR idSau = ?",
            [id, id]
        );
        return rows || null;
    }

    async getFullTransferChain(idSau) {
        const chain = [];
        let currentId = idSau;
        while (true) {
            const [rows] = await this.mysql.execute(
                "SELECT * FROM LichSuChuyenGiao WHERE idSau = ?",
                [currentId]
            );
            if (rows.length === 0) break;
            const transfer = rows[0];
            chain.unshift(transfer); // Thêm vào đầu mảng để giữ thứ tự từ gốc đến hiện tại
            currentId = transfer.idTruoc;
        }
        return chain;
    }

    async update(id, payload) {
        const assignment = await this.extractAssignmentData(payload);
        let sql = "UPDATE PhanCong SET ";
        const fields = [];
        const params = [];
        for (const key in assignment) {
            if (key === "id") continue;
            fields.push(`${key} = ?`);
            params.push(assignment[key]);
        }
        sql += fields.join(", ") + " WHERE id = ?";
        params.push(id);
        await this.mysql.execute(sql, params);
        return { ...assignment };
    }

    async delete(id) {
        const assignment = await this.findById(id);
        if (!assignment) return null;
        const deletedAt = new Date();
        await this.mysql.execute(
            "UPDATE PhanCong SET deactive = ? WHERE id = ?",
            [deletedAt, id]
        );
        return id;
    }

    async restore(id) {
        const [result] = await this.mysql.execute(
            "UPDATE PhanCong SET deactive = NULL WHERE id = ?",
            [id]
        );
        return result.affectedRows > 0;
    }

    async deleteAll() {
        const deletedAt = new Date();
        await this.mysql.execute(
            "UPDATE PhanCong SET deactive = ? WHERE deactive IS NULL",
            [deletedAt]
        );
        return true;
    }

    async report(idPhanCong, payload) {
        const assignment = await this.findById(idPhanCong);
        if (!assignment) return null;

        const idDinhKem = payload.idDinhKem || null;

        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();

            const baoCaoId = await this.generateUniqueBaoCaoId(connection);
            const reportData = this.extractReportData(payload);

            await connection.execute(
                `INSERT INTO BaoCao
                (id, moTa, tienDoCaNhan, trangThai, idNguoiGui, idPhanCong, idDinhKem)
                VALUES (?,?,?,?,?,?,?)`,
                [
                    baoCaoId,
                    reportData.moTa,
                    reportData.tienDoCaNhan,
                    reportData.trangThai,
                    reportData.idNguoiGui,
                    idPhanCong,
                    idDinhKem,
                ]
            );

            const fields = [];
            const params = [];
            if (reportData.tienDoCaNhan !== null) {
                fields.push("tienDoCaNhan = ?");
                params.push(reportData.tienDoCaNhan);
            }
            if (reportData.trangThai) {
                fields.push("trangThai = ?");
                params.push(reportData.trangThai);
            }
            if (fields.length) {
                params.push(idPhanCong);
                await connection.execute(
                    `UPDATE PhanCong SET ${fields.join(", ")} WHERE id = ?`,
                    params
                );
            }

            await connection.commit();
            return {
                baoCaoId,
                idDinhKem,
                updatedTienDo: reportData.tienDoCaNhan,
                updatedTrangThai: reportData.trangThai,
            };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

}

module.exports = AssignmentService;