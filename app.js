const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/router');

const {
  MONGO_URL = 'mongodb://localhost:27017/mestodb',
  PORT = 3000,
} = process.env;

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '644fd6a33dad4696a5ad7b79',
  };
  next();
});

app.use(router);

async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    await app.listen(PORT);
  } catch (err) {
    console.log(err);
  }
}

start()
  .then(() => console.log(`Приложение успешно запущенно!\n${MONGO_URL}\nPort: ${PORT}`));
