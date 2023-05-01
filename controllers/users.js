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

module.exports.createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
  } = req.body;

  userSchema
    .create({
      name,
      about,
      avatar,
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
    });
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
//     .catch((err) => {
//       if (err.name === 'CastError' || err.name === 'ValidationError') {
//         res.status(400)
//           .send({ message: 'Переданы некорректные данные при обновлении аватара' });
//       } else {
//         res.status(500)
//           .send({ message: err.message });
//       }
//     });
// };
