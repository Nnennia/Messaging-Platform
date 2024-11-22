const express = require("express");
const bodyParser = require("body-parser");
const { db } = require("./config/db");
require("dotenv").config();

const userRouter = require("./routes/user.routes");

const app = express();
const PORT = process.env.PORT;
app.use(bodyParser.json());
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Internal Server Error" });
});
app.use("/", userRouter);
const server = () => {
	try {
		db();
		app.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Error connecting to database:", error);
	}
};
server();
