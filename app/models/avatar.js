var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var AvatarSchema = new Schema({
  name: String,
  filename: String,
  gender: String,
  category: String,
  price: Number,
});

mongoose.model('Avatar', AvatarSchema);
