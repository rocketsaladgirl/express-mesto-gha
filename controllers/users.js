const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = require('../models/user');

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

module.exports.getUsers = (req, res, next) => {
  userSchema
    .find({})
    .then((users) => res.status(200)
      .send(users))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  const { userId } = req.params;

  userSchema
    .findById(userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден');
    })
    .then((user) => res.status(200)
      .send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      }

      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
      next(err);
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
      if (err.code === 11000) {
        throw new ConflictError('Пользователь с таким email уже существует');
      } else if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при создании пользователя');
      }
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
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
    .orFail(() => {
      throw new NotFoundError('Пользователь с указанным _id не найден');
    })
    .then((user) => res.status(200)
      .send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при обновлении профиля');
      }
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
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
    .orFail(() => {
      throw new NotFoundError('Аватар пользователя по указанному _id не найден');
    })
    .then((user) => res.status(200)
      .send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при обновлении аватара');
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return userSchema
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'JWT-token', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};
