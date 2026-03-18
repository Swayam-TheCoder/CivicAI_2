const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/userController");
const { protect, restrict } = require("../middleware/auth");
const { mongoIdRule, validate } = require("../middleware/validators");

router.use(protect, restrict("admin"));

router.get("/",        ctrl.getUsers);
router.get("/:id",     mongoIdRule("id"), validate, ctrl.getUser);
router.patch("/:id",   mongoIdRule("id"), validate, ctrl.updateUser);
router.delete("/:id",  mongoIdRule("id"), validate, ctrl.deleteUser);

module.exports = router;
