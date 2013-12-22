var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var BotSchema = new Schema({
  username: String,
  avatar: String
});

mongoose.model('Bot', BotSchema);

