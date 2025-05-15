const express = require("express");
const notifications = require("../controllers/ThongBao.controller");

const router = express.Router();

router.route("/")
    .get(notifications.findAll)
    .post(notifications.create)
    .delete(notifications.deleteAll);

router.route("/:id")
    .get(notifications.findOne)
    .put(notifications.update)
    .delete(notifications.delete);

module.exports = router;