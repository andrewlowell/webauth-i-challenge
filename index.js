const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./data/dbConfig.js');

const server = express();
server.use(cors());
server.use(express.json());

const authenticated = (req, res, next) => {
  const { username, password } = req.headers;
  console.log(username, password)
  if (username && password) {
    db('users')
      .where({ username: username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          next();
        }
        else {
          res.status(401).json({ message: "Credentials are invalid." })
        }
      })
      .catch(err => {
        res.status(500).json({ message: "Something went wrong" })
      });
  }
  else {
    res.status(400).json({ message: "Please provide a username and password" })
  }
}

server.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 4);
  db('users').insert({
    username: username,
    password: hash
  })
  .then(success => {
    res.status(200).json({ message: "Register successful"});
  })
  .catch(error => {
    res.status(400).json({ message: "Register unsuccessful"});
  })
});

server.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db('users')
  .where({ username: username })
  .first()
  .then(user => {
    console.log('user login', user);
    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({ message: "Successfully logged in!" })
    }
    else {
      res.status(401).json({ message: "Invalid credentials." })
    }
  })
  .catch(err => {
    res.status(400).json({ message: "You shall not pass" })
  })
});

server.get('/api/users', authenticated, (req, res) => {
  db('users')
  .then(users => {
    res.json(users);
  })
  .catch(err => {
    res.status(500).json({ message: "Something went wrong" });
  })
})

const port = process.env.PORT || 5555;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));