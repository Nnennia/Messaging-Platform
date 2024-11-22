const express = require("express");
const User = require("../handler/user.handler");
const userRouter = express.Router();
userRouter.route("/auth").post(User);
module.exports = userRouter;
