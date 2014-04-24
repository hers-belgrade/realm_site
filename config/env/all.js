var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 80,
	//port: process.env.PORT || 16010,
    db: process.env.MONGOHQ_URL    
}
