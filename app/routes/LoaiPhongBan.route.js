const express = require("express");
const deptRole = require("../controllers/LoaiPhongBan.controller");

const router = express.Router();

router.route("/")
    .get(deptRole.findAll)
    .post(deptRole.create)
    .delete(deptRole.deleteAll);

router.route("/:id")
    .get(deptRole.findOne)
    .put(deptRole.update)
    .delete(deptRole.delete);

module.exports = router;