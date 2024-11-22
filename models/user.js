const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
	username: { type: String, required: true },
	password: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	createdAt: { type: Date, default: Date.now },
});

const User = model("User", userSchema);

module.exports = User;
