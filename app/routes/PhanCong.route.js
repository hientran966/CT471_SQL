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

router.route("/:id/pending")
    .get(assignment.getPendingTransfer);

router.route("/user/:id/transfer")
    .get(assignment.getTransferByUser);

router.route("/:id/transfer")
    .get(assignment.findTransferHistory);

router.route("/:id/transfer/start")
    .put(assignment.startTransfer);

router.route("/:id/transfer/complete")
    .put(assignment.completeTransfer);

router.route("/:id/transfer/reject")
    .put(assignment.rejectTransfer);

router.route("/:id/chain")
    .get(assignment.getFullTransferChain);

router.route("/:id/report")
    .get(assignment.getReport)
    .put(assignment.report);

router.route("/task/:task")
    .get(assignment.findByTask);

module.exports = router;
