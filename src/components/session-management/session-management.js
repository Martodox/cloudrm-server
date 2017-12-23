import { express, authenticatedMiddleware } from '/services/http-server';
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

express.use(apiNamespace + '/sessions', (req, res, next) => {
  switch(req.method) {
    case 'GET':
    case 'DELETE':
      return authenticatedMiddleware(req, res, next);
    default:
      return next();
  }
});

export class SessionManagement {
  constructor() {



    /**
     * @swagger
     * /sessions:
     *   get:
     *     description: Gets current session
     *     tags:
     *      - Session
     */
    express.get(apiNamespace + '/sessions', (req, res) => {

      let response = {
          session: req.Session.User.dataValues
      };

      response.session.token = req.headers.token;

      res.send(response);
    });

    /**
     * @swagger
     * /sessions:
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
    express.post(apiNamespace + '/sessions', async (req, res) => {

      
      const newSession = req.body.session;

      const isValid = validate(newSession, constraints);

      if (!!isValid) {
        return res.status(400).send({
          message: 'Request invalid',
          reason: isValid
        });
      }

      const user = await User.find({
        where: {
          username: newSession.username
        }
      });

      if (!user || !bcrypt.compareSync(newSession.password, user.password)) {
          return res.status(400).send({
              message: 'Request invalid',
              reason: {
                  'email_password': 'Bad password or username'
              }
          });
      }

      const token = Session.rawAttributes.token.defaultValue();

      await Session.upsert({
          'user_id': user.id,
          token: token
      });

      let response = {
        session: user.dataValues
      };

      response.session.token = token;
      delete response.session.password;

      return res.send(response);

    });


    /**
     * @swagger
     * /sessions:
     *   delete:
     *     description: Logout
     *     tags:
     *      - Session
     */
    express.delete(apiNamespace + '/sessions', (req, res) => {

      req.Session.destroy().then(rows => {
        res.send({status: 'Successfully logged out'});
      });


    });

    /**
     * @swagger
     * /sessions/new:
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
    express.post(apiNamespace + '/sessions/new', (req, res) => {

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