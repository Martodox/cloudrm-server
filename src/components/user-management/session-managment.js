import { express } from '/services/http-server';
import validate from 'validate.js';
import { User, Session } from '/models/index';
import bcrypt from 'bcrypt-nodejs';

var constraints = {
  username: {
    presence: true
  },
  password: {
    presence: true
  }
};

export default class SessionManagment {
  constructor() {

    express.get('/session', (req, res) => {
      res.send(req.Session.User);
    });

    express.post('/session', (req, res) => {

      const isValid = validate(req.body, constraints);

      if (!!isValid) {
        return res.status(400).send({
          message: 'Request invalid',
          reason: isValid
        });
      }

      User.find({
        where: {
          username: req.body.username
        }
      }).then((row, error) => {

        if (!row || !bcrypt.compareSync(req.body.password, row.password)) {
          return res.status(400).send({
            message: 'Request invalid',
            reason: {
              'email_password': 'Bad password or username'
            }
          });
        }

        const token = Session.rawAttributes.token.defaultValue();

        Session.upsert({
          'user_id': row.id,
          token: token
        }).then((row, err) => {
          return res.send({
            token: token
          })
        })

      });

    });

    express.delete('/session', (req, res) => {

      req.Session.destroy().then(rows => {
        res.send({status: 'Successfully logged out'});
      });


    })

  }
}