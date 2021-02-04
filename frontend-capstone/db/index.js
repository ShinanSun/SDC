const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const { Schema } = mongoose;

mongoose.connect(
  'mongodb://172.17.0.3:27017/reviews-api',
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) {
      mongoose.connect('mongodb://172.17.0.2:27017/reviews-api', {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
      });
    }
  }
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('MongoDB Connected !!!!!');
});
autoIncrement.initialize(db);

const reviewSchema = new Schema({
  id: { type: Number, required: true },
  product_id: { type: Number, required: true },
  rating: { type: String, required: true },
  date: { type: String, default: new Date().toString() },
  summary: { type: String, maxLength: 60 },
  body: { type: String, required: true, minLength: 20, maxLength: 1000 },
  recommend: { type: String, required: true },
  reported: { type: String, default: 'false' },
  reviewer_name: {
    type: String,
    required: true,
    maxLength: 60,
    trim: true, // get rid of extra spaces
  },
  reviewer_email: {
    type: String,
    required: true,
    maxLength: 60,
    validate(value) {
      if (!value.includes('@')) throw new Error(`Email is invalid`);
    },
  },
  response: { type: String, default: '' },
  helpfulness: { type: Number, default: 0 },
});
reviewSchema.plugin(autoIncrement.plugin, {
  model: 'Reviews',
  field: 'id',
  startAt: 5777924,
  incrementBy: 1,
});
const Reviews = mongoose.model('Reviews', reviewSchema);

const Characteristics = mongoose.model(
  'Characteristics',
  new Schema({
    id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    name: { type: String, required: true },
  }),
  'characteristics'
);

const metaSchema = new Schema({
  id: Number,
  characteristics_id: { type: Number, required: true },
  review_id: { type: Number, required: true },
  value: { type: Number, required: true },
});
metaSchema.plugin(autoIncrement.plugin, {
  model: 'Meta_join',
  field: 'id',
  startAt: 19337415,
  incrementBy: 1,
});
const Meta_join = mongoose.model('Meta_join', metaSchema, 'meta_join');

photoSchema = new Schema({
  id: Number,
  review_id: Number,
  url: { type: String, required: true },
});
photoSchema.plugin(autoIncrement.plugin, {
  model: 'Photos',
  field: 'id',
  startAt: 2742900,
  incrementBy: 1,
});
const Photos = mongoose.model('Photos', photoSchema, 'photos');

module.exports = { Reviews, Characteristics, Meta_join, Photos };
