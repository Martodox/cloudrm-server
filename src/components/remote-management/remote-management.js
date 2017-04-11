import keypair from 'keypair';
import webworkerThreads from 'webworker-threads';
import validate from 'validate.js';

import { express, authenticatedMiddleware } from '/services/http-server';
import { Remote } from '/models/index';
import { config, localConfig } from '/services/config';

const { Worker } = webworkerThreads;

const apiNamespace = localConfig.apiPath;

const newRemoteConstraints = {
  deviceId: {
    presence: true
  }
};

// express.use(apiNamespace + '/remotes', (req, res, next) => {
//   switch(req.method) {
//     case 'GET':
//     case 'DELETE':
//       return authenticatedMiddleware(req, res, next);
//     default:
//       return next();
//   }
// });


export default class RemoteManagement {
  constructor() {

    /**
     * @swagger
     * /remotes/new:
     *   post:
     *     description: Allows to register new device
     *     parameters:
     *       - name: deviceId
     *         description: Unique device's id. Usually mac address
     *         in: formData
     *         required: false
     *         type: string
     *     responses:
     *       200:
     *         description: auth token
     *       400:
     *        description: error message
     *     tags:
     *      - Remote
     */
    express.post(apiNamespace + '/remotes/new', (req, res) => {


      const isValid = validate(req.body, newRemoteConstraints);

      if (!!isValid) {
        return res.status(400).send({
          message: 'Request invalid.',
          reason: isValid
        });
      }

      const keys = keypair();

      Remote.upsert({
        device_id: req.body.deviceId,
        pem: keys.public
      }).then(() => {
        res.send({
          key: keys.private
        })
      }, err => {
        console.log(err);
        res.status(400).send({
          message: 'Request invalid.',
          reason: err
        })
      }).catch(err => {
        res.status(400).send({
          message: 'Server failure',
          reason: err
        })
      });

    });

  }
}