const express = require("express");
const auth = require("../controllers/TaiKhoan.controller");

const router = express.Router();

router.route("/")
    .get(auth.findAll)
    .post(auth.create)
    .delete(auth.deleteAll);

router.route("/login")
    .post(auth.login);

router.route("/:id")
    .get(auth.findOne)
    .put(auth.update)
    .delete(auth.delete);

module.exports = router;