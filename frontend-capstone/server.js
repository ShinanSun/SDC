require('newrelic');
const express = require('express');
// const db = require('./db/index');
const port = 3000;
const path = require('path');
const routes = require('./routes');

const app = express();
app.use(express.json());
app.use(express.static('dist'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

//declare routes;
app.use('/reviews', routes);

app.listen(port, () =>
  console.log(`app listening at http://localhost:${port}`)
);
