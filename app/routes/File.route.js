const express = require("express");
const file = require("../controllers/File.controller");

const router = express.Router();

router.route("/")
    .get(file.findAll)
    .post(file.create)
    .delete(file.deleteAll);

router.route("/:id")
    .get(file.findOne)
    .put(file.update)
    .delete(file.delete);

module.exports = router;