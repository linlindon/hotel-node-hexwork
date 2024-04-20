const headers = require('./headers');

const errorHandler = (res, error) => {
	res.writeHead(400, headers);
	res.write(JSON.stringify({
		"status": "false",
		"message": "欄位不正確，或無此 id",
		"error": error.message
	}))
	res.end();
};

module.exports = errorHandler;