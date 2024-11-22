const connectToRedis = require("../config/redis"); // Import Redis connection
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Ensure Redis client is connected before making any requests
const auth = async (req, res) => {
	try {
		const { action } = req.body;

		// Initialize Redis connection if not already connected
		const client = await connectToRedis(); // Use the Redis connection

		if (action === "signup") {
			const { username, password, email } = req.body;

			// Check if the username or email already exists
			const existingUser = await User.findOne({
				$or: [{ username }, { email }],
			});

			if (existingUser) {
				return res
					.status(400)
					.json({ error: "Username or email already exists" });
			}

			// Validate email format
			function validEmail(email) {
				let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return re.test(email);
			}

			if (!validEmail(email)) {
				return res.status(400).json({ error: "Invalid Email Address" });
			}

			// Hash the password and create a new user
			const hashedPassword = await bcrypt.hash(password, 10);
			const user = await User.create({
				username,
				password: hashedPassword,
				email,
			});

			return res.status(201).json({ message: "User has been created" });
		} else if (action === "login") {
			const { username, password } = req.body;

			console.log(`Looking up user: ${username}`);
			const user = await User.findOne({ username });
			console.log("Query Results:", user);

			// Check if user exists
			if (!user) {
				return res
					.status(401)
					.json({ error: "Incorrect username or password." });
			}

			// Check Redis for lockout state
			const lockout = await client.get(`${username}:lockout`);
			if (lockout) {
				console.log(`User ${username} is locked out for ${lockout} seconds.`);
				return res.status(429).json({
					error:
						"Too many failed login attempts. Please try again after 5 minutes.",
				});
			}

			// Check Redis for failed login attempts
			let attempts = (await client.get(username)) || 0;
			attempts = parseInt(attempts, 10); // Ensure it's an integer
			console.log(`Redis attempts for ${username}: ${attempts}`);

			// Compare the provided password with the hashed password
			const validPassword = await bcrypt.compare(password, user.password);
			if (!validPassword) {
				// Increment failed attempts and set/reset expiration time
				await client.incr(username);
				attempts++;

				if (attempts === 1) {
					await client.expire(username, 300); // 300 seconds = 5 minutes
				}

				console.log(`Failed login attempts for ${username}: ${attempts}`);

				if (attempts >= 3) {
					const lockoutDuration = 300;
					await client.set(`${username}:lockout`, "1", { EX: lockoutDuration }); // Lockout for 5 minutes
					console.log(
						`User ${username} is locked out for ${
							lockoutDuration / 60
						} minutes.`
					);
					return res.status(429).json({
						error:
							"Too many failed login attempts. Please try again after 5 minutes.",
					});
				}

				return res.status(401).json({
					error: "Incorrect username or password.",
				});
			}

			// Check if user is in lockout period
			if (await client.get(`${username}:lockout`)) {
				return res.status(429).json({
					error:
						"Too many failed login attempts. Please try again after 5 minutes.",
				});
			}

			// Reset failed attempts and lockout on successful login
			await client.del(username);
			await client.del(`${username}:lockout`);
			console.log(`Login successful for ${username}.`);

			// Generate JWT
			const token = jwt.sign(
				{ username: user.username },
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);

			return res.status(200).json({ message: "Login successful", token });
		} else {
			return res.status(400).json({ error: "Invalid action" });
		}
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = auth;
