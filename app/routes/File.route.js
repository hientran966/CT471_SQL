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

router.route("/:id/version")
    .get(file.findAllVersion)
    .post(file.addVersion);

router.route("/:id/version/:versionId")
    .get(file.findVersion)

router.route("/:id/version/:versionId/approve")
    .put(file.approve);

router.post("/avatar/:id", file.uploadAvatar);

module.exports = router;