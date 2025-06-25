class TaskService {
  constructor(mysql) {
    this.mysql = mysql;
  }

  async extractTaskData(payload) {
    return {
      tenCV: payload.tenCV,
      moTa: payload.moTa,
      ngayBD: payload.ngayBD ?? null,
      ngayKT: payload.ngayKT ?? null,
      deactive: payload.deactive ?? null,
      idNguoiTao: payload.idNguoiTao ?? null,
      idDuAn: payload.idDuAn ?? null,
    };
  }

  async create(payload) {
    const task = await this.extractTaskData(payload);
    const connection = await this.mysql.getConnection();
    try {
      await connection.beginTransaction(); // Bắt đầu transaction

      // Bước 1: Chèn task chưa có id
      const [result] = await connection.execute(
        `INSERT INTO CongViec (tenCV, moTa, ngayBD, ngayKT, deactive, idNguoiTao, idDuAn)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          task.tenCV,
          task.moTa,
          task.ngayBD,
          task.ngayKT,
          task.deactive,
          task.idNguoiTao,
          task.idDuAn,
        ]
      );

      // Bước 2: Lấy autoId để gán id mới dạng CVxxxxxx
      const autoId = result.insertId;
      const newId = "CV" + autoId.toString().padStart(6, "0");

      // Bước 3: Cập nhật id theo định dạng
      await connection.execute(
        "UPDATE CongViec SET id = ? WHERE autoId = ?",
        [newId, autoId]
      );

      await connection.commit(); // Hoàn tất transaction
      return { id: newId, ...task };
    } catch (error) {
      await connection.rollback(); // Rollback nếu có lỗi
      throw error;
    } finally {
      connection.release(); // Giải phóng kết nối
    }
  }

  async find(filter = {}) {
    let sql = "SELECT * FROM CongViec WHERE deactive IS NULL";
    let params = [];

    if (filter.tenCV) {
      sql += " AND tenCV LIKE ?";
      params.push(`%${filter.tenCV}%`);
    }
    if (filter.idDuAn) {
      sql += " AND idDuAn = ?";
      params.push(filter.idDuAn);
    }
    if (filter.ngayBD) {
      sql += " AND ngayBD >= ?";
      params.push(filter.ngayBD);
    }
    if (filter.ngayKT) {
      sql += " AND ngayKT <= ?";
      params.push(filter.ngayKT);
    }
    if (filter.idNguoiTao) {
      sql += " AND idNguoiTao = ?";
      params.push(filter.idNguoiTao);
    }
    const [rows] = await this.mysql.execute(sql, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await this.mysql.execute(
      "SELECT * FROM CongViec WHERE id = ? AND deactive IS NULL",
      [id]
    );
    return rows[0] || null;
  }

  async update(id, payload) {
    const task = await this.extractTaskData(payload);
    let sql = "UPDATE CongViec SET ";
    const fields = [];
    const params = [];
    for (const key in task) {
      if (key === "id") continue;
      fields.push(`${key} = ?`);
      params.push(task[key]);
    }
    sql += fields.join(", ") + " WHERE id = ?";
    params.push(id);
    await this.mysql.execute(sql, params);
    return { ...task, id };
  }

  async delete(id) {
    const user = await this.findById(id);
    if (!user) return null;
    const deletedAt = new Date();
    await this.mysql.execute("UPDATE CongViec SET deactive = ? WHERE id = ?", [
      deletedAt,
      id,
    ]);
    return { ...user, deactive: deletedAt };
  }

  async restore(id) {
    const [result] = await this.mysql.execute(
      "UPDATE CongViec SET deactive = NULL WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  async deleteAll() {
    const deletedAt = new Date();
    await this.mysql.execute("UPDATE CongViec SET deactive = ?", [deletedAt]);
    return true;
  }

  async findByAccountId(accountId) {
    const sql = `
      SELECT DISTINCT  cv.* FROM CongViec cv
      INNER JOIN PhanCong pc ON cv.id = pc.idCongViec
      WHERE pc.idNguoiNhan = ? AND cv.deactive IS NULL
    `;
    const [rows] = await this.mysql.execute(sql, [accountId]);
    return rows;
  }
}

module.exports = TaskService;
