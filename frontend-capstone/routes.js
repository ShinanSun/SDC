const express = require('express');
const router = express.Router();
const { Reviews, Characteristics, Meta_join, Photos } = require('./db/index');

router.get('/', async (req, res) => {
  // console.log(req.originalUrl);
  var { product_id, page = 1, count = 2, sort = 'newest' } = req.query;
  page = Number(page);
  count = Number(count);

  if (!product_id) return res.send({});
  // res.status(400).send("Bad Request. Can't retrieve reviews without product_id");

  try {
    let final = {
      product: product_id,
      page,
      count,
      results: [],
    };
    let docs;
    if (sort === 'helpful') {
      docs = await Reviews.find({ product_id })
        .sort({ helpfulness: -1 })
        .limit(count);
    } else if (sort === 'newest') {
      docs = await Reviews.find({ product_id }).sort({ date: -1 }).limit(count);
    } else if (sort === 'relevant') {
      docs = await Reviews.find({ product_id })
        .sort({ recommend: -1 })
        .limit(count);
    } else {
      return res.status(400).send('Bad Request');
    }
    if (!docs) return res.send({}); //res.status(404).send('Not Found');

    var promiseArray = docs.map((doc) => {
      final.results.push({
        review_id: doc.id,
        rating: Number(doc.rating),
        summary: doc.summary,
        recommend:
          doc.recommend == '1' || doc.recommend == 'true' ? true : false,
        response: doc.response,
        body: doc.body,
        date: doc.date,
        reviewer_name: doc.reviewer_name,
        helpfulness: doc.helpfulness,
      });

      return Photos.find({ review_id: doc.id })
        .exec()
        .then((data) =>
          data.map((item) => {
            return { id: item.id, url: item.url };
          })
        );
    });

    Promise.all(promiseArray)
      .then((results) => {
        for (var i = 0; i < results.length; i++) {
          final.results[i].photos = results[i];
        }
        res.send(final);
      })
      .catch((err) => res.sendStatus(404));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:review_id/report', async (req, res) => {
  const id = Number(req.params.review_id);
  try {
    const review = await Reviews.findOneAndUpdate(
      { id },
      { reported: 'true' },
      { new: true }
    );
    if (!review) return res.send(`review_id is not valid.`);
    //res.status(404).send(`review_id is not valid.`);

    res.sendStatus(204);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:review_id/helpful', async (req, res) => {
  const id = Number(req.params.review_id);
  try {
    const doc = await Reviews.findOne({ id });

    if (!doc) return res.send(`id not valid`); //res.sendStatus(404);

    await Reviews.updateOne(
      { id: Number(id) },
      { helpfulness: doc.helpfulness + 1 }
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/meta', async (req, res) => {
  const product_id = Number(req.query.product_id);
  try {
    const docs = await Reviews.find({ product_id })
      .select('rating recommend')
      .exec();
    if (!docs) return res.send({}); //res.sendStatus(404);

    const ratingObj = {};
    const recommendObj = { true: 0, false: 0 };
    docs.forEach((doc) => {
      if (!ratingObj[doc.rating]) {
        ratingObj[doc.rating] = 1;
      } else {
        ratingObj[doc.rating]++;
      }
      if (doc.recommend == 'true' || doc.recommend == '1') {
        recommendObj['true']++;
      } else {
        recommendObj['false']++;
      }
    });

    var charObj = {};
    const charDocs = await Characteristics.find({ product_id }).exec();
    if (!charDocs) return res.send({}); //res.sendStatus(404);

    var promiseArray = charDocs.map((doc) => {
      return Meta_join.findOne({ characteristic_id: doc.id }).exec();
    });

    Promise.all(promiseArray)
      .then((results) => {
        for (var i = 0; i < results.length; i++) {
          charObj[charDocs[i].name] = {
            id: charDocs[i].id,
            value: results[i].value,
          };
        }
        res.send({
          product_id,
          ratings: ratingObj,
          recommended: recommendObj,
          characteristics: charObj,
        });
      })
      .catch((err) => res.status(400).send(err));
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'product_id',
    'rating',
    'recommend',
    'characteristics',
    'summary',
    'body',
    'photos',
    'name',
    'email',
  ];
  const isAllowedOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isAllowedOperation)
    return res.status(400).send('error: Invalid updates!');

  const {
    product_id,
    rating,
    recommend,
    characteristics,
    summary,
    body,
    photos,
    name,
    email,
  } = req.body;
  try {
    let newReview = {
      product_id,
      rating,
      summary: summary || '',
      body,
      recommend,
      reviewer_name: name,
      reviewer_email: email,
    };
    const review = new Reviews(newReview);
    const savedReview = await review.save();

    if (photos.length > 0) {
      photos.forEach((url) => {
        new Photos({ review_id: savedReview.id, url }).save();
      });
    }

    console.log(characteristics);
    for (let key in characteristics) {
      Meta_join.findOneAndUpdate(
        { characteristics_id: parseInt(key) },
        { value: parseInt(characteristics[key]) },
        { new: true }
      ).exec((err, data) => {
        if (err) throw new Error(err);
      });
    }

    res.sendStatus(201);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Meta_join.find()
//   .sort({ _id: -1 })
//   .limit(1)
//   .exec((err, data) => console.log(data));
module.exports = router;
