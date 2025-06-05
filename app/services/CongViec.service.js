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
      idNhomCV: payload.idNhomCV ?? null,
      idDuAn: payload.idDuAn ?? null,
    };
  }

  async create(payload) {
    const task = await this.extractTaskData(payload);
    const connection = await this.mysql.getConnection();
    try {
      await connection.beginTransaction(); // Bắt đầu Transaction
      
      const [rows] = await connection.execute(
        "SELECT id FROM CongViec WHERE id LIKE 'CV%%%%%%' ORDER BY id DESC LIMIT 1"
      );
      let newIdNumber = 1;
      if (rows.length > 0) {
        const lastId = rows[0].id;
        const num = parseInt(lastId.slice(2), 10);
        if (!isNaN(num)) newIdNumber = num + 1;
      }
      const newId = "CV" + newIdNumber.toString().padStart(6, "0");
      task.id = newId;

      const [result] = await connection.execute(
        "INSERT INTO CongViec (id, tenCV, moTa, ngayBD, ngayKT, deactive, idNguoiTao, idNhomCV, idDuAn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          task.id,
          task.tenCV,
          task.moTa,
          task.ngayBD,
          task.ngayKT,
          task.deactive,
          task.idNguoiTao,
          task.idNhomCV,
          task.idDuAn,
        ]
      );
      await connection.commit(); // Commit Transaction
      return { id: task.id, ...task };
    } catch (error) {
      await connection.rollback(); // Rollback Transaction nếu có lỗi
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
    if (filter.idNhomCV) {
      sql += " AND idNhomCV = ?";
      params.push(filter.idNhomCV);
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
}

module.exports = TaskService;
