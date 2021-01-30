const express = require('express');
const router = express.Router();
const { Reviews, Characteristics, Meta_join, Photos } = require('./db/index');

router.get('/', async (req, res) => {
  const { product_id, page = 1, count = 5, sort = 'helpful' } = req.query;
  if (!product_id)
    return res
      .status(400)
      .send("Bad Request. Can't retrieve reviews without product_id");

  try {
    let final = {
      product: product_id,
      page: Number(page),
      count: Number(count),
      results: [],
    };
    let docs;
    if (sort === 'helpful') {
      docs = await Reviews.find({ product_id }).sort({ helpfulness: -1 });
    } else if (sort === 'newest') {
      docs = await Reviews.find({ product_id }).sort({ date: -1 });
    } else if (sort === 'relevant') {
      docs = await Reviews.find({ product_id }).sort({ recommend: -1 });
    } else {
      return res.status(400).send('Bad Request');
    }
    if (!docs) return res.status(404).send('Not Found');
    // console.log('waht are docs .........', docs, final);

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

    // console.log(`what is doc now`, final);
    Promise.all(promiseArray).then((results) => {
      // console.log(`what is reuslt here .......`, results);
      for (var i = 0; i < results.length; i++) {
        final.results[i].photos = results[i];
      }

      res.send(final);
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Photos.find({ review_id: 9 }).exec((err, data) => {
//   console.log(`waht is data?`, data);
// });
router.put('/:review_id/report', async (req, res) => {
  const id = Number(req.params.review_id);
  try {
    const review = await Reviews.findOneAndUpdate(
      { id },
      { reported: 'true' },
      { new: true }
    );
    console.log(review);
    if (!review) return res.status(404).send(`review_id is not valid.`);

    res.sendStatus(204);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:review_id/helpful', async (req, res) => {
  const id = req.params.review_id;
  try {
    const doc = await Reviews.findOne({ id: Number(id) });

    if (!doc) return res.sendStatus(404);

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
    const docs = await Reviews.find({ product_id }).exec();
    if (!docs) return res.sendStatus(404);

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
    if (!charDocs) return res.sendStatus(404);

    var promiseArray = charDocs.map((doc) => {
      return Meta_join.findOne({ characteristic_id: doc.id }).exec();
    });

    Promise.all(promiseArray).then((results) => {
      // console.log(`results`, results);
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
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/', async (req, res) => {
  try {
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
