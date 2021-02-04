const jwt = require("jsonwebtoken");

module.exports = (client) => {
	return {
		cache: function (req, res, next) {
			const { id } = req.query;
			const { isAuthenticated } = req.headers;

			if (id) {
				var key = isAuthenticated ? `${id}-auth` : id;
			} else {
				var key = isAuthenticated ? `qotd-auth` : "qotd";
            }
			client.get(key, (err, data) => {
				if (err) throw error;
				if (data) {
                    console.log(`Serving ${key} question from cache.`);
                    try {
                        data = JSON.parse(data);
                        return res.json(data)
                    } catch (error) {
                        return res.send(data)
                    }
				} else {
					next();
				}
			});
		},
		auth: async function (req, res, next) {
			if (req.headers.isAuthenticated) {
				return res.status(500).json({ message: "Invalid header isAuthenticated" });
			}
			const { authorization } = req.headers;
			if (authorization) {
				try {
					const token = authorization.split(" ")[1];
					if (!token) {
						return res.send({ question: "Token not found in auth header" });
					}
					await jwt.verify(token, process.env.JWT_SECRET);
					req.headers.isAuthenticated = true;
				} catch (error) {
					console.error(`Middleware: auth: ${error.stack ? error.stack : error}`);
					req.headers.isAuthenticated = false;
				}
			} else {
				req.headers.isAuthenticated = false;
			}
			next();
		},
	};
};
