const { createClient } = require("redis");
require("dotenv").config();

let client; // Shared Redis client instance

const connectToRedis = async () => {
	if (!client) {
		client = createClient({
			password: process.env.password, // Match environment variable naming conventions
			socket: {
				host: process.env.host, // Update environment variable names for clarity
				port: process.env.redis_port,
			},
		});

		client.on("error", (err) => {
			console.error("Redis Client Error:", err);
		});
	}

	if (!client.isOpen) {
		try {
			await client.connect();
			console.log("Connected to Redis...");
		} catch (err) {
			console.error("Error connecting to Redis:", err);
			throw new Error("Redis connection error");
		}
	}

	return client; // Return the connected Redis client instance
};

module.exports = connectToRedis;
