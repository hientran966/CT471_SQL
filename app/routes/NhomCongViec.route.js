const express = require("express");
const taskGroup = require("../controllers/NhomCongViec.controller");

const router = express.Router();

router.route("/")
    .get(taskGroup.findAll)
    .post(taskGroup.create)
    .delete(taskGroup.deleteAll);

router.route("/:id")
    .get(taskGroup.findOne)
    .put(taskGroup.update)
    .delete(taskGroup.delete);

module.exports = router;