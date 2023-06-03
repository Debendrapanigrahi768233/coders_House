const router = require("express").Router();
const authController = require("./Controllers/auth-controller");
const activateController = require("./Controllers/activate-controller");
const authMiddleware = require("./middlewares/auth-middleware");
const roomsController = require("./Controllers/rooms-controller");

router.post("/api/send-otp", authController.sendOtp);
router.post("/api/verify-otp", authController.verifyOtp);
router.post("/api/activate", authMiddleware, activateController.activate);

router.get("/api/refresh", authController.refresh);
router.post("/api/logout", authMiddleware, authController.logout);

router.post("/api/rooms", authMiddleware, roomsController.create);
router.get("/api/rooms", authMiddleware, roomsController.index);

router.get("/api/rooms/:roomId", authMiddleware, roomsController.show);

module.exports = router;
