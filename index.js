const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./data/dbConfig.js');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

const server = express();
server.use(cors());
server.use(express.json());

const sessionConfig = {
  name: 'monster', // defaults to sid
  secret: 'keep it secret, keep it safe!',
  cookie: {
    maxAge: 1000 * 60 * 10, // milliseconds
    secure: false, // use cookie over https
    httpOnly: true, // false means JS can access the cookie on the client
  },
  resave: false, // avoid recreating unchanged sessions
  saveUninitialized: false, // GDPR compliance
  store: new KnexSessionStore({
    knex: db,
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 1000 * 60 * 30
  })
};

server.use(session(sessionConfig));

const authenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  }
  else {
    res.status(400).json({ message: "Need to log in with correct credentials" })
  }
}

// const authenticated = (req, res, next) => {
//   const { username, password } = req.headers;
//   console.log(username, password)
//   if (username && password) {
//     db('users')
//       .where({ username: username })
//       .first()
//       .then(user => {
//         if (user && bcrypt.compareSync(password, user.password)) {
//           next();
//         }
//         else {
//           res.status(401).json({ message: "Credentials are invalid." })
//         }
//       })
//       .catch(err => {
//         res.status(500).json({ message: "Something went wrong" })
//       });
//   }
//   else {
//     res.status(400).json({ message: "Please provide a username and password" })
//   }
// }

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
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = user;
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