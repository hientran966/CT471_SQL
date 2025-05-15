const express = require("express");
const comment = require("../controllers/VanDe.controller");

const router = express.Router();

router.route("/")
    .get(comment.findAll)
    .post(comment.create)
    .delete(comment.deleteAll);

router.route("/:id")
    .get(comment.findOne)
    .put(comment.update)
    .delete(comment.delete);

module.exports = router;