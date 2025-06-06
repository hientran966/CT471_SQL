const express = require("express");
const calendar = require("../controllers/LichNghi.controller");

const router = express.Router();

router.route("/")
    .get(calendar.findAll)
    .post(calendar.create)
    .delete(calendar.deleteAll);

router.route("/:id")
    .get(calendar.findOne)
    .put(calendar.update)
    .delete(calendar.delete);

router.post("/ngaybu", calendar.createNgayBu);
router.get("/ngaybu/:idNgayBu", calendar.getNgayBu);

module.exports = router;