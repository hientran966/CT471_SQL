const express = require("express");
const role = require("../controllers/VaiTro.controller");

const router = express.Router();

router.route("/")
    .get(role.findAll)
    .post(role.create)
    .delete(role.deleteAll);

router.route("/:id")
    .get(role.findOne)
    .put(role.update)
    .delete(role.delete);

module.exports = router;