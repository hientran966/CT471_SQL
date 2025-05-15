const express = require("express");
const department = require("../controllers/PhongBan.controller");

const router = express.Router();

router.route("/")
    .get(department.findAll)
    .post(department.create)
    .delete(department.deleteAll);

router.route("/:id")
    .get(department.findOne)
    .put(department.update)
    .delete(department.delete);

module.exports = router;