class AssignmentService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractAssignmentData(payload) {
        return {
            moTa: payload.moTa,
            idCongViec: payload.idCongViec,
            tienDoCaNhan: payload.tienDoCaNhan,
            idNguoiNhan: payload.idNguoiNhan,
            ngayNhan: payload.ngayNhan ?? null,
            ngayHoanTat: payload.ngayHoanTat ?? null,
            trangThai: payload.trangThai ?? "Chưa bắt đầu",
        };
    }

    async extractTransferData(payload) {
        return {
            moTaChuyenGiao: payload.moTaChuyenGiao,
            idNguoiNhanMoi: payload.idNguoiNhanMoi,
            ngayNhanMoi: payload.ngayNhanMoi,
        };
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

    async findTransferHistory(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM LichSuChuyenGiao WHERE idTruoc = ? OR idSau = ?",
            [id, id]
        );
        return rows || null;
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
}

module.exports = AssignmentService;