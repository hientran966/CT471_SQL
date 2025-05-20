const express = require("express");
const assignment = require("../controllers/PhanCong.controller");

const router = express.Router();

router.route("/")
    .get(assignment.findAll)
    .post(assignment.create)
    .delete(assignment.deleteAll);

router.route("/:id")
    .get(assignment.findOne)
    .put(assignment.update)
    .delete(assignment.delete);

router.route("/:id/transfer")
    .get(assignment.findTransferHistory)
    .put(assignment.transfer);

module.exports = router;