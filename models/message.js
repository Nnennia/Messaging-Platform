const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const messageSchema = new Schema({
	sender: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
	receiver: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
	content: { type: String, required: true }, // Message text content
	createdAt: { type: Date, default: Date.now }, // Timestamp for when the message was sent
	status: {
		type: String,
		enum: ["sent", "delivered", "read"],
		default: "sent",
	}, // Message delivery/read status
});

const Message = model("Message", messageSchema);

module.exports = Message;
