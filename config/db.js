const mongoose = require("mongoose");

const db = async () => {
	try {
		mongoose.set("strictQuery", false);
		await mongoose.connect(process.env.MONGO_URL);
		console.log("MongoDB is connected");
	} catch (error) {
		console.error("MongoDB connection error", error);
	}
};

module.exports = { db };
