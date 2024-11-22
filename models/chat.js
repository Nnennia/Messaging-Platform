const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const chatSchema = new Schema({
	participants: [
		{ type: Schema.Types.ObjectId, ref: "User", required: true }, // Array of User IDs
	],
	isGroupChat: { type: Boolean, default: false }, // Indicates if it's a group chat
	groupName: {
		type: String,
		required: function () {
			return this.isGroupChat;
		},
	}, // Name of the group (if group chat)
	messages: [
		{ type: Schema.Types.ObjectId, ref: "Message" }, // Array of Message IDs
	],
	createdAt: { type: Date, default: Date.now }, // Timestamp when the chat was created
	updatedAt: { type: Date, default: Date.now }, // Timestamp when the chat was last updated
});

const Chat = model("Chat", chatSchema);

module.exports = Chat;
