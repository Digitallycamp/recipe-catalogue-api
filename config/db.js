const mongoose = require('mongoose');

function dbConfig(url) {
	const connection = mongoose.connect(url);

	return connection;
}

module.exports = dbConfig;
