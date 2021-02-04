//require('newrelic');
const express = require('express');
const port = 3000;
const routes = require('./routes');

const app = express();
app.use(express.json());

//declare routes;
app.use('/reviews', routes);

app.listen(port, () =>
  console.log(`app listening at http://localhost:${port}`)
);
