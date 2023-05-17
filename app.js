const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');

const router = require('./routes/router');

const { createUser, login } = require('./controllers/users');
const { validationCreateUser, validationLogin } = require('./middlewares/validations');
const auth = require('./middlewares/auth');
const handleError = require('./middlewares/handelError');

const {
  MONGO_URL = 'mongodb://localhost:27017/mestodb',
  PORT = 3000,
} = process.env;

const app = express();

app.use(express.json());

app.post('/signup', validationCreateUser, createUser);
app.post('/signin', validationLogin, login);

app.use(auth);
app.use(router);
app.use(errors());
app.use(helmet());
app.use(handleError);

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
