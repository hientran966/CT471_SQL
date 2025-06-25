const express = require("express");
const auth = require("../controllers/TaiKhoan.controller");

const router = express.Router();

router.route("/")
    .get(auth.findAll)
    .post(auth.create)
    .delete(auth.deleteAll);

router.get("/department/:id", auth.getDepartment);

router.route("/deactive/:id")
    .put(auth.restore)

router.route("/deactive")
    .get(auth.getDeactive)

router.route("/login")
    .post(auth.login);

router.route("/avatar/:id")
    .get(auth.getAvatar);

router.route("/:id")
    .get(auth.findOne)
    .put(auth.update)
    .delete(auth.delete);

router.route("/:id/password")
    .put(auth.changePassword);
router.route("/:id/assign")
    .get(auth.getAssignNumber);
router.route("/:id/role")
    .get(auth.getRole);
router.route("/:id/department")
    .get(auth.getUserDepartment);

module.exports = router;