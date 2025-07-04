class AssignmentService {
    constructor(mysql) {
        this.mysql = mysql;
    }

    async extractAssignmentData(payload) {
        const result = {};
        if (payload.moTa !== undefined) result.moTa = payload.moTa;
        if (payload.idCongViec !== undefined) result.idCongViec = payload.idCongViec;
        if (payload.tienDoCaNhan !== undefined) result.tienDoCaNhan = payload.tienDoCaNhan;
        if (payload.doQuanTrong !== undefined) result.doQuanTrong = payload.doQuanTrong;
        if (payload.idNguoiNhan !== undefined) result.idNguoiNhan = payload.idNguoiNhan;
        result.ngayNhan = payload.ngayNhan ?? null;
        result.ngayHoanTat = payload.ngayHoanTat ?? null;
        result.trangThai = payload.trangThai ?? "Chưa bắt đầu";
        return result;
    }

    async extractTransferData(payload) {
        return {
            moTa: payload.moTa,
            idNguoiNhan: payload.idNguoiNhan,
            idNguoiGui: payload.idNguoiGui,
            idCongViec: payload.idCongViec,
            ngayNhanMoi: payload.ngayNhanMoi,
            trangThai: payload.trangThai ?? "Chờ nhận",
            isTransfer: payload.isTransfer ?? 1,
        };
    }

    extractReportData(payload) {
        return {
            moTa: payload.moTa ?? null,
            tienDoCaNhan: payload.tienDoCaNhan ?? null,
            trangThai: payload.trangThai ?? null,
            idNguoiGui: payload.idNguoiGui,
            ngayCapNhat: payload.ngayCapNhat ?? new Date(),
        };
    }

    async create(payload) {
        const assignment = await this.extractAssignmentData(payload);
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction(); // Bắt đầu Transaction

            // Bước 1: Chèn bản ghi chưa có `id`
            const [result] = await connection.execute(
                `INSERT INTO PhanCong (idCongViec, doQuanTrong, tienDoCaNhan, idNguoiNhan, ngayNhan, ngayHoanTat, trangThai, moTa)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    assignment.idCongViec,
                    assignment.doQuanTrong,
                    assignment.tienDoCaNhan,
                    assignment.idNguoiNhan,
                    assignment.ngayNhan,
                    assignment.ngayHoanTat,
                    assignment.trangThai,
                    assignment.moTa,
                ]
            );

            // Bước 2: Sinh id từ autoId
            const autoId = result.insertId;
            const newId = "PC" + autoId.toString().padStart(6, "0");

            // Bước 3: Cập nhật id
            await connection.execute(
                "UPDATE PhanCong SET id = ? WHERE autoId = ?",
                [newId, autoId]
            );

            await connection.commit();
            return { id: newId, ...assignment };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
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
            const reportData = this.extractReportData(payload);

            // B1: Insert bản ghi chưa có id
            const [result] = await connection.execute(
                `INSERT INTO BaoCao
                (moTa, tienDoCaNhan, trangThai, idNguoiGui, idPhanCong, idDinhKem, ngayCapNhat)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    reportData.moTa,
                    reportData.tienDoCaNhan,
                    reportData.trangThai,
                    reportData.idNguoiGui,
                    idPhanCong,
                    idDinhKem,
                    reportData.ngayCapNhat || new Date(),
                ]
            );

            // B2: Cập nhật id từ autoId
            const autoId = result.insertId;
            const baoCaoId = "BC" + autoId.toString().padStart(6, "0");
            await connection.execute(
                "UPDATE BaoCao SET id = ? WHERE autoId = ?",
                [baoCaoId, autoId]
            );

            // Cập nhật PhanCong nếu cần
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
                if (
                    reportData.tienDoCaNhan !== null &&
                    Number(reportData.tienDoCaNhan) >= 100
                ) {
                    fields.push("ngayHoanTat = ?");
                    params.push(new Date());
                }

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

    async initiateTransfer(id, payload) {
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();

            // B1: Thêm bản ghi mới chưa có id
            const [result] = await connection.execute(
                `INSERT INTO LichSuChuyenGiao (idTruoc, idSau, moTa, idNguoiNhan, idNguoiGui, trangThai, idCongViec, isTransfer)
                VALUES (?, NULL, ?, ?, ?, 'Chưa nhận', ?, ?)`,
                [
                    id,
                    payload.moTa ?? null,
                    payload.idNguoiNhan ?? null,
                    payload.idNguoiGui ?? null,
                    payload.idCongViec,
                    payload.isTransfer ?? 1,
                ]
            );

            // B2: Sinh id từ autoId
            const autoId = result.insertId;
            const transferId = "CG" + autoId.toString().padStart(6, "0");

            await connection.execute(
                "UPDATE LichSuChuyenGiao SET id = ? WHERE autoId = ?",
                [transferId, autoId]
            );

            await connection.commit();
            return { id: transferId };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    async acceptTransfer(idChuyenGiao, payload) {
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();

            // Lấy thông tin chuyển giao
            const [cgRows] = await connection.execute(
                "SELECT * FROM LichSuChuyenGiao WHERE id = ? AND trangThai = 'Chưa nhận'",
                [idChuyenGiao]
            );
            if (!cgRows.length) throw new Error("Không tìm thấy chuyển giao đang chờ nhận.");

            const transfer = cgRows[0];
            const ngayNhanMoi = payload.ngayNhanMoi || new Date();

            // Lấy phân công cũ
            const [assignRows] = await connection.execute(
                "SELECT * FROM PhanCong WHERE id = ?",
                [transfer.idTruoc]
            );
            if (!assignRows.length) throw new Error("Phân công cũ không tồn tại.");

            const oldAssignment = assignRows[0];

            // Tạo phân công mới
            const [insertResult] = await connection.execute(
                `INSERT INTO PhanCong (idCongViec, moTa, tienDoCaNhan, idNguoiNhan, ngayNhan, ngayHoanTat, trangThai)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    oldAssignment.idCongViec,
                    oldAssignment.moTa,
                    oldAssignment.tienDoCaNhan,
                    transfer.idNguoiNhan,
                    ngayNhanMoi,
                    null,
                    oldAssignment.trangThai
                ]
            );
            const newAutoId = insertResult.insertId;
            const newAssignmentId = "PC" + newAutoId.toString().padStart(6, "0");

            // Cập nhật id cho bản ghi vừa chèn
            await connection.execute(
                "UPDATE PhanCong SET id = ? WHERE autoId = ?",
                [newAssignmentId, newAutoId]
            );

            // Cập nhật bản ghi chuyển giao
            await connection.execute(
                "UPDATE LichSuChuyenGiao SET idSau = ?, trangThai = 'Đã nhận' WHERE id = ?",
                [newAssignmentId, idChuyenGiao]
            );

            // Đánh dấu phân công cũ là đã chuyển giao
            await connection.execute(
                "UPDATE PhanCong SET trangThai = ?, ngayHoanTat = ? WHERE id = ?",
                ["Đã chuyển giao", new Date(), transfer.idTruoc]
            );

            await connection.commit();
            return { newAssignmentId };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    async rejectTransfer(idChuyenGiao) {
        const connection = await this.mysql.getConnection();
        try {
            await connection.beginTransaction();

            // Cập nhật trạng thái chuyển giao
            await connection.execute(
                "UPDATE LichSuChuyenGiao SET trangThai = 'Từ chối' WHERE id = ?",
                [idChuyenGiao]
            );

            await connection.commit();
            return { id: idChuyenGiao, status: "Từ chối" };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    async getTransferByUser(userId, idCongViec = null) {
        let sql = "SELECT * FROM LichSuChuyenGiao WHERE (idNguoiNhan = ? OR idNguoiGui = ?)";
        const params = [userId, userId];

        if (idCongViec) {
            sql += " AND idCongViec = ?";
            params.push(idCongViec);
        }

        const [rows] = await this.mysql.execute(sql, params);
        return rows || [];
    }

    async getPendingTransfer(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM LichSuChuyenGiao WHERE idSau = ? AND trangThai = 'Chưa nhận'",
            [id]
        );
        return rows[0] || null;
    }

    async getReportById(id) {
        const [rows] = await this.mysql.execute(
            "SELECT * FROM BaoCao WHERE idPhanCong = ?",
            [id]
        );
        return rows || null;
    }
}

module.exports = AssignmentService;