var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 80,
	//port: process.env.PORT || 16008,
    db: process.env.MONGOHQ_URL    
}
