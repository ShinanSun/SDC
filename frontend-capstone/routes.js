const express = require('express');
const router = express.Router();
const { Reviews } = require('./db/index');

router.get('/', (req, res) => {
  res.send('hello from reviews api server!');
});

router.put('/:review_id/report', async (req, res) => {
  const id = req.params.review_id;
  try {
    const review = await Reviews.findOneAndUpdate(
      { id: Number(id) },
      { reported: 'true' },
      { new: true }
    );
    if (!review) return res.status(404).send(`review_id is not valid.`);

    res.send(review.reported); //res.sendStatus(204) no content;
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:review_id/helpful', async (req, res) => {
  const id = req.params.review_id;
  try {
    const doc = await Reviews.findOne({ id: Number(id) });

    if (!doc) return res.sendStatus(404);

    //console.log(`helpfulness`, doc.helpfulness);
    await Reviews.updateOne(
      { id: Number(id) },
      { helpfulness: doc.helpfulness + 1 }
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
