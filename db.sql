SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `baocao`;
CREATE TABLE `baocao` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `moTa` varchar(45) DEFAULT NULL,
  `tienDoCaNhan` int DEFAULT NULL,
  `trangThai` varchar(45) DEFAULT NULL,
  `deactive` datetime DEFAULT NULL,
  `idNguoiGui` varchar(8) DEFAULT NULL,
  `idPhanCong` varchar(8) DEFAULT NULL,
  `idDinhKem` varchar(8) DEFAULT NULL,
  `ngayCapNhat` datetime DEFAULT NULL,
  KEY `id` (`id`),
  KEY `idNguoiGui` (`idNguoiGui`),
  KEY `idDinhKem` (`idDinhKem`),
  KEY `idPhanCong` (`idPhanCong`),
  CONSTRAINT `baocao_ibfk_1` FOREIGN KEY (`idNguoiGui`) REFERENCES `taikhoan` (`id`),
  CONSTRAINT `baocao_ibfk_2` FOREIGN KEY (`idDinhKem`) REFERENCES `file` (`id`),
  CONSTRAINT `baocao_ibfk_3` FOREIGN KEY (`idPhanCong`) REFERENCES `phancong` (`id`)
);

DROP TABLE IF EXISTS `chucvu`;
CREATE TABLE `chucvu` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `tenChucVu` varchar(45) DEFAULT NULL,
  `phanQuyen` int DEFAULT NULL,
  KEY `id` (`id`)
);

DROP TABLE IF EXISTS `congviec`;
CREATE TABLE `congviec` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `tenCV` varchar(100) NOT NULL,
  `moTa` text,
  `ngayBD` date DEFAULT NULL,
  `ngayKT` date DEFAULT NULL,
  `deactive` datetime DEFAULT NULL,
  `idNguoiTao` varchar(8) DEFAULT NULL,
  `idNhomCV` varchar(8) DEFAULT NULL,
  `idDuAn` varchar(8) DEFAULT NULL,
  KEY `id` (`id`),
  KEY `idNguoiTao` (`idNguoiTao`),
  KEY `idNhomCV` (`idNhomCV`),
  KEY `idDuAn` (`idDuAn`),
  CONSTRAINT `congviec_ibfk_1` FOREIGN KEY (`idNguoiTao`) REFERENCES `taikhoan` (`id`),
  CONSTRAINT `congviec_ibfk_2` FOREIGN KEY (`idNhomCV`) REFERENCES `nhomcongviec` (`id`),
  CONSTRAINT `congviec_ibfk_3` FOREIGN KEY (`idDuAn`) REFERENCES `duan` (`id`)
);

DROP TABLE IF EXISTS `duan`;
CREATE TABLE `duan` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `tenDA` varchar(100) NOT NULL,
  `ngayBD` date DEFAULT NULL,
  `ngayKT` date DEFAULT NULL,
  `trangThai` enum('Chưa bắt đầu','Đang tiến hành','Đã hoàn thành') DEFAULT NULL,
  `deactive` datetime DEFAULT NULL,
  `idNguoiTao` varchar(8) DEFAULT NULL,
  KEY `id` (`id`),
  KEY `idNguoiTao` (`idNguoiTao`),
  CONSTRAINT `duan_ibfk_1` FOREIGN KEY (`idNguoiTao`) REFERENCES `taikhoan` (`id`)
);

DROP TABLE IF EXISTS `file`;
CREATE TABLE `file` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `tenFile` varchar(200) DEFAULT NULL,
  `deactive` datetime DEFAULT NULL,
  `idNguoiTao` varchar(8) DEFAULT NULL,
  `idCongViec` varchar(8) DEFAULT NULL,
  `idPhanCong` varchar(8) DEFAULT NULL,
  `idDuAn` varchar(45) DEFAULT NULL,
  KEY `id` (`id`),
  KEY `idNguoiTao` (`idNguoiTao`),
  KEY `idCongViec` (`idCongViec`),
  KEY `fk_File_idPhanCong` (`idPhanCong`),
  KEY `fk_File_idDuAn_idx` (`idDuAn`),
  CONSTRAINT `file_ibfk_1` FOREIGN KEY (`idNguoiTao`) REFERENCES `taikhoan` (`id`),
  CONSTRAINT `file_ibfk_2` FOREIGN KEY (`idCongViec`) REFERENCES `congviec` (`id`),
  CONSTRAINT `fk_File_idDuAn` FOREIGN KEY (`idDuAn`) REFERENCES `duan` (`id`),
  CONSTRAINT `fk_File_idPhanCong` FOREIGN KEY (`idPhanCong`) REFERENCES `phancong` (`id`)
);

DROP TABLE IF EXISTS `lichnghi`;
CREATE TABLE `lichnghi` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `tieuDe` text,
  `ngayBD` datetime DEFAULT NULL,
  `ngayKT` datetime DEFAULT NULL,
  `deactive` datetime DEFAULT NULL,
  `idNgayBu` varchar(8) DEFAULT NULL,
  KEY `id` (`id`),
  KEY `idNgayBu` (`idNgayBu`),
  CONSTRAINT `lichnghi_ibfk_1` FOREIGN KEY (`idNgayBu`) REFERENCES `ngaybu` (`id`)
);

DROP TABLE IF EXISTS `lichsuchuyengiao`;
CREATE TABLE `lichsuchuyengiao` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `moTa` text,
  `idTruoc` varchar(8) DEFAULT NULL,
  `idSau` varchar(8) DEFAULT NULL,
  `deactive` datetime DEFAULT NULL,
  `trangThai` varchar(45) DEFAULT NULL,
  `idNguoiNhan` varchar(45) DEFAULT NULL,
  `idNguoiGui` varchar(45) DEFAULT NULL,
  KEY `id` (`id`),
  KEY `idTruoc` (`idTruoc`),
  KEY `idSau` (`idSau`),
  KEY `lichsuchuyengiao_ibfk_3_idx` (`idNguoiNhan`),
  KEY `lichsuchuyengiao_ibfk_4_idx` (`idNguoiGui`),
  CONSTRAINT `lichsuchuyengiao_ibfk_1` FOREIGN KEY (`idTruoc`) REFERENCES `phancong` (`id`),
  CONSTRAINT `lichsuchuyengiao_ibfk_2` FOREIGN KEY (`idSau`) REFERENCES `phancong` (`id`),
  CONSTRAINT `lichsuchuyengiao_ibfk_3` FOREIGN KEY (`idNguoiNhan`) REFERENCES `taikhoan` (`id`),
  CONSTRAINT `lichsuchuyengiao_ibfk_4` FOREIGN KEY (`idNguoiGui`) REFERENCES `taikhoan` (`id`)
);

DROP TABLE IF EXISTS `loaiphongban`;
CREATE TABLE `loaiphongban` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `loaiPhongBan` varchar(45) DEFAULT NULL,
  `phanQuyen` int DEFAULT NULL,
  KEY `id` (`id`)
);

DROP TABLE IF EXISTS `ngaybu`;
CREATE TABLE `ngaybu` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `ngayBD` datetime DEFAULT NULL,
  `ngayKT` datetime DEFAULT NULL,
  `deactive` datetime DEFAULT NULL,
  KEY `id` (`id`)
);

DROP TABLE IF EXISTS `nhomcongviec`;
CREATE TABLE `nhomcongviec` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `tenNhom` varchar(100) NOT NULL,
  `deactive` datetime DEFAULT NULL,
  `idDuAn` varchar(8) DEFAULT NULL,
  `idNguoiTao` varchar(8) DEFAULT NULL,
  KEY `id` (`id`),
  KEY `idDuAn` (`idDuAn`),
  KEY `idNguoiTao` (`idNguoiTao`),
  CONSTRAINT `nhomcongviec_ibfk_1` FOREIGN KEY (`idDuAn`) REFERENCES `duan` (`id`),
  CONSTRAINT `nhomcongviec_ibfk_2` FOREIGN KEY (`idNguoiTao`) REFERENCES `taikhoan` (`id`)
);

DROP TABLE IF EXISTS `phancong`;
CREATE TABLE `phancong` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `moTa` varchar(45) DEFAULT NULL,
  `ngayNhan` datetime DEFAULT NULL,
  `ngayHoanTat` datetime DEFAULT NULL,
  `doQuanTrong` int DEFAULT NULL,
  `tienDoCaNhan` int DEFAULT NULL,
  `trangThai` varchar(45) DEFAULT NULL,
  `deactive` datetime DEFAULT NULL,
  `idNguoiNhan` varchar(8) DEFAULT NULL,
  `idCongViec` varchar(8) DEFAULT NULL,
  KEY `id` (`id`),
  KEY `idNguoiNhan` (`idNguoiNhan`),
  KEY `idCongViec` (`idCongViec`),
  CONSTRAINT `phancong_ibfk_1` FOREIGN KEY (`idNguoiNhan`) REFERENCES `taikhoan` (`id`),
  CONSTRAINT `phancong_ibfk_2` FOREIGN KEY (`idCongViec`) REFERENCES `congviec` (`id`)
);

DROP TABLE IF EXISTS `phienban`;
CREATE TABLE `phienban` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `soPB` int DEFAULT NULL,
  `duongDan` text,
  `ngayUpload` datetime DEFAULT CURRENT_TIMESTAMP,
  `deactive` datetime DEFAULT NULL,
  `idFile` varchar(8) DEFAULT NULL,
  `trangThai` varchar(45) DEFAULT NULL,
  KEY `id` (`id`),
  KEY `idFile` (`idFile`),
  CONSTRAINT `phienban_ibfk_1` FOREIGN KEY (`idFile`) REFERENCES `file` (`id`)
);

DROP TABLE IF EXISTS `phongban`;
CREATE TABLE `phongban` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `tenPhong` varchar(100) NOT NULL,
  `phanQuyen` enum('Cao','Trung','Thấp') NOT NULL,
  `deactive` datetime DEFAULT NULL,
  KEY `id` (`id`)
);

DROP TABLE IF EXISTS `taikhoan`;
CREATE TABLE `taikhoan` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `vaiTro` varchar(45) NOT NULL,
  `tenNV` varchar(100) NOT NULL,
  `gioiTinh` enum('Nam','Nữ') NOT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `diaChi` varchar(200) DEFAULT NULL,
  `deactive` datetime DEFAULT NULL,
  `idPhong` varchar(8) DEFAULT NULL,
  `avatar` varchar(8) DEFAULT NULL,
  `admin` tinyint DEFAULT NULL,
  `updateAt` datetime DEFAULT NULL,
  KEY `id` (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idPhong` (`idPhong`),
  KEY `fk_TaiKhoan_avatar` (`avatar`),
  CONSTRAINT `fk_TaiKhoan_avatar` FOREIGN KEY (`avatar`) REFERENCES `file` (`id`),
  CONSTRAINT `taikhoan_ibfk_1` FOREIGN KEY (`idPhong`) REFERENCES `phongban` (`id`)
);

DROP TABLE IF EXISTS `thongbao`;
CREATE TABLE `thongbao` (
  `autoId` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` varchar(8) NOT NULL,
  `tieuDe` varchar(100) DEFAULT NULL,
  `noiDung` text,
  `ngayDang` datetime DEFAULT CURRENT_TIMESTAMP,
  `deactive` datetime DEFAULT NULL,
  `idNguoiDang` varchar(8) DEFAULT NULL,
  `idPhanCong` varchar(8) DEFAULT NULL,
  `idCongViec` varchar(8) DEFAULT NULL,
  `idNhomCV` varchar(8) DEFAULT NULL,
  `idDuAn` varchar(8) DEFAULT NULL,
  `idPhanHoi` varchar(8) DEFAULT NULL,
  `idPhienBan` varchar(8) DEFAULT NULL,
  KEY `id` (`id`),
  KEY `idNguoiDang` (`idNguoiDang`),
  KEY `idPhanCong` (`idPhanCong`),
  KEY `idCongViec` (`idCongViec`),
  KEY `idNhomCV` (`idNhomCV`),
  KEY `idDuAn` (`idDuAn`),
  KEY `idPhanHoi` (`idPhanHoi`),
  KEY `idPhienBan` (`idPhienBan`),
  CONSTRAINT `thongbao_ibfk_1` FOREIGN KEY (`idNguoiDang`) REFERENCES `taikhoan` (`id`),
  CONSTRAINT `thongbao_ibfk_2` FOREIGN KEY (`idPhanCong`) REFERENCES `phancong` (`id`),
  CONSTRAINT `thongbao_ibfk_3` FOREIGN KEY (`idCongViec`) REFERENCES `congviec` (`id`),
  CONSTRAINT `thongbao_ibfk_4` FOREIGN KEY (`idNhomCV`) REFERENCES `nhomcongviec` (`id`),
  CONSTRAINT `thongbao_ibfk_5` FOREIGN KEY (`idDuAn`) REFERENCES `duan` (`id`),
  CONSTRAINT `thongbao_ibfk_6` FOREIGN KEY (`idPhanHoi`) REFERENCES `thongbao` (`id`),
  CONSTRAINT `thongbao_ibfk_7` FOREIGN KEY (`idPhienBan`) REFERENCES `phienban` (`id`)
);