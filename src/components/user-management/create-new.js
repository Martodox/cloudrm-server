import { express } from '/services/http-server';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt-nodejs';
import { User, Session } from '/models/index';
import validate from 'validate.js';

var constraints = {
  username: {
    presence: true,
    length: {maximum: 30}
  },
  email: {
    email: true
  },
  password: {
    presence: true
  }
};



export default class CreateNew {
  constructor() {
    express.post('/user/new', bodyParser.urlencoded({ extended: false }), (req, res) => {

      const isValid = validate(req.body, constraints);

      if (!!isValid) {
        return res.status(400).send({
          message: 'Request invalid',
          reason: isValid
        });
      }

      User.findAll({
        where: {
          $or: {
            username: req.body.username,
            email: req.body.email
          }
        }
      }).then((row, error) => {

        if (row.length > 0) {
          return res.status(400).send({
            message: 'Request invalid',
            reason: {
              'email_username': 'Email or username already taken'
            }
          });
        }

        const password = bcrypt.hashSync(req.body.password);

        //TODO: better error handling!

        User.create({
          password: password,
          username: req.body.username,
          email: req.body.email
        }).then((row, err) => {

          Session.create({
            'user_id': row.id
          }).then((row, err) => {
            return res.send({
              token: row.token,
              user: {
                username: req.body.username,
                email: req.body.email
              }
            })
          })

        })

      });

    })
  }
}