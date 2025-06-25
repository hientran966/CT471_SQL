const express = require("express");
const notifications = require("../controllers/ThongBao.controller");

const router = express.Router();

router.get("/task/:id", notifications.findByTask);
router.get("/project/:id", notifications.findByProject);
router.get("/group/:id", notifications.findByGroup);
router.get("/assignment/:id", notifications.findByAssignment);
router.get("/comment/:id", notifications.findByComment);
router.get("/version/:id", notifications.findByVersion);
router.get("/account/:id", notifications.findByUser);
router.get("/receive/:id", notifications.findByReceive);

router.route("/")
    .get(notifications.findAll)
    .post(notifications.create)
    .delete(notifications.deleteAll);

router.route("/:id")
    .get(notifications.findOne)
    .put(notifications.update)
    .delete(notifications.delete);

module.exports = router;