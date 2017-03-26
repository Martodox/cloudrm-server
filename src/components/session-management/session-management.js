import { express } from '/services/http-server';
import validate from 'validate.js';
import { User, Session } from '/models/index';
import bcrypt from 'bcrypt-nodejs';
import { config, localConfig } from '/services/config';
const constraints = {
  username: {
    presence: true
  },
  password: {
    presence: true
  }
};

const newUserConstraints = {
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

const apiNamespace = localConfig.apiPath;

export default class SessionManagement {
  constructor() {



    /**
     * @swagger
     * /session:
     *   get:
     *     description: Gets current session
     *     tags:
     *      - Session
     */
    express.get(apiNamespace + '/session', (req, res) => {
      res.send(req.Session.User);
    });

    /**
     * @swagger
     * /session:
     *   post:
     *     description: Login to the application
     *     parameters:
     *       - name: username
     *         description: Username to use for login.
     *         in: formData
     *         required: true
     *         type: string
     *       - name: password
     *         description: User's password.
     *         in: formData
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: auth token
     *       400:
     *        description: error message
     *     tags:
     *      - Session
     */
    express.post(apiNamespace + '/session', (req, res) => {

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


    /**
     * @swagger
     * /session:
     *   delete:
     *     description: Logout
     *     tags:
     *      - Session
     */
    express.delete(apiNamespace + '/session', (req, res) => {

      req.Session.destroy().then(rows => {
        res.send({status: 'Successfully logged out'});
      });


    });

    /**
     * @swagger
     * /session/new:
     *   post:
     *     description: Creates new account
     *     parameters:
     *       - name: username
     *         description: Unique username
     *         in: formData
     *         required: true
     *         type: string
     *       - name: email
     *         description: User email
     *         in: formData
     *         required: true
     *         type: string
     *       - name: password
     *         description: User password
     *         in: formData
     *         required: true
     *         type: string
     *     tags:
     *      - Session
     */
    express.post(apiNamespace + '/session/new', (req, res) => {

      const isValid = validate(req.body, newUserConstraints);

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

    });

  }
}