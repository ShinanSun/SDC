const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://0.0.0.0:27017/reviews-api', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log('MongoDB Connected !!!!!');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
connectDB();

const Schema = mongoose.Schema;
//var User = mongoose.model('User', new Schema({}), 'users');

const Reviews = mongoose.model(
  'Reviews',
  new Schema({
    id: Number,
    rating: String,
    reported: String,
    helpfulness: Number,
  }),
  'reviews'
);

module.exports = { Reviews };
// const User = mongoose.model('User', {
//   name: {
//     type: String,
//   },
// });

// const me = new User({ name: 'Shinan' });

// me.save().then(() => console.log(me.name));
