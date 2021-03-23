const jwt = require("jwt-simple");
const User = require("../models/user");
const config = require("../config");

function tokenForUser(user) {
  const timestamp = new Date().getDate();
  return jwt.encode({ sub: user.id, iot: timestamp }, config.secret);
}

exports.signin = function (req, res, next) {
  // User has already had their email and password
  // We just need to give them a token

  res.send({ token: tokenForUser(req.user), name: req.user.lastname });
};

exports.signup = function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;

  if (!email || !password) {
    return res
      .status(401)
      .send({ error: " You must provide email and password " });
  }

  //See if a user with the given email exists
  User.findOne({ email: email }, function (err, existingUser) {
    if (err) {
      return next(err);
    }

    // If a user with email does exit , return an error
    if (existingUser) {
      return res.status(409).send({ err: "Email is in use" });
    }

    //If a user with email do not exist, create and save record
    const user = new User({
      email: email,
      password: password,
      firstname: firstname,
      lastname: lastname,
    });

    user.save(function (err) {
      if (err) {
        return next(err);
      }

      //Respond to request indicating the user was created
      res.json({ token: tokenForUser(user), name: lastname });
    });
  });
};
