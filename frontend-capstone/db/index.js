const mongoose = require('mongoose');
const { Schema } = mongoose;

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

const reviewSchema = new Schema({
  _id: String,
  id: Number,
  product_id: Number,
  rating: String,
  date: String,
  summary: String,
  body: String,
  recommend: String,
  reported: String,
  reviewer_name: String,
  reviewer_email: String,
  response: String,
  helpfulness: Number,
});
const Reviews = mongoose.model('Reviews', reviewSchema);

const Characteristics = mongoose.model(
  'Characteristics',
  new Schema({
    id: Number,
    product_id: Number,
    name: String,
  }),
  'characteristics'
);

const Meta_join = mongoose.model(
  'Meta_join',
  new Schema({
    id: Number,
    Characteristics_id: Number,
    review_id: Number,
    value: Number,
  }),
  'meta_join'
);

module.exports = { Reviews, Characteristics, Meta_join };
// const User = mongoose.model('User', {
//   name: {
//     type: String,
//   },
// });

// const me = new User({ name: 'Shinan' });

// me.save().then(() => console.log(me.name));
