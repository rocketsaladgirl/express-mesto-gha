const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = require('../models/user');

module.exports.getUsers = (req, res) => {
  userSchema
    .find({})
    .then((users) => res.send(users))
    .catch((err) => res.status(500)
      .send({ message: err.message }));
};

module.exports.getUserById = (req, res) => {
  const { userId } = req.params;

  userSchema
    .findById(userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400)
          .send({ message: 'Переданы некорректные данные при создании пользователя' });
      }

      if (err.name === 'DocumentNotFoundError') {
        return res.status(404)
          .send({ message: 'Пользователь по указанному _id не найден' });
      }

      return res.status(500)
        .send({ message: err.message });
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      userSchema
        .create({
          name,
          about,
          avatar,
          email,
          password: hash,
        });
    })
    .then((user) => res.status(201)
      .send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400)
          .send({ message: 'Переданы некорректные данные при создании пользователя' });
      } else {
        res.status(500)
          .send({ message: err.message });
      }
    })
    .catch(next);
};

module.exports.updateUser = (req, res) => {
  const {
    name,
    about,
  } = req.body;

  userSchema
    .findByIdAndUpdate(
      req.user._id,
      {
        name,
        about,
      },
      {
        new: true,
        runValidators: true,
      },
    )
    .orFail()
    .then((user) => res.status(200)
      .send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res.status(400)
          .send({ message: 'Переданы некорректные данные при обновлении профиля' });
      }

      if (err.name === 'DocumentNotFoundError') {
        return res.status(404)
          .send({ message: 'Пользователь по указанному _id не найден' });
      }

      return res.status(500)
        .send({ message: err.message });
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;

  userSchema
    .findByIdAndUpdate(
      req.user._id,
      { avatar },
      {
        new: true,
        runValidators: true,
      },
    )
    .orFail()
    .then((user) => res.status(200)
      .send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return res.status(400)
          .send({ message: 'Переданы некорректные данные при обновлении аватара' });
      }

      if (err.name === 'DocumentNotFoundError') {
        return res.status(404)
          .send({ message: 'Аватар пользователя по указанному _id не найден' });
      }

      return res.status(500)
        .send({ message: err.message });
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return userSchema
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'JWT_token', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};
