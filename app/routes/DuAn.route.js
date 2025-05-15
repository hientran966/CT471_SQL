const express = require("express");
const project = require("../controllers/DuAn.controller");

const router = express.Router();

router.route("/")
    .get(project.findAll)
    .post(project.create)
    .delete(project.deleteAll);

router.route("/:id")
    .get(project.findOne)
    .put(project.update)
    .delete(project.delete);

module.exports = router;