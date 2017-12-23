import keypair from 'keypair';
import validate from 'validate.js';

import {express, authenticatedMiddleware} from '/services/http-server';
import {Remote, User} from '/models/index';
import {config, localConfig} from '/services/config';


const apiNamespace = localConfig.apiPath;

const newRemoteConstraints = {
    deviceId: {
        presence: true
    }
};

express.use(apiNamespace + '/remotes', (req, res, next) => {
    switch (req.method) {
        case 'POST':
        case 'GET':
            return authenticatedMiddleware(req, res, next);
        default:
            return next();
    }
});


export class RemoteManagement {
    constructor(SocketServer) {

        this.socketServer = SocketServer;

        /**
         * @swagger
         * /new-remote:
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
         *         description: public key
         *       400:
         *        description: error message
         *     tags:
         *      - Remote
         */
        express.post(`${apiNamespace}/new-remote`, (req, res) => {


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

        /**
         * @swagger
         * /remotes/invoke:
         *   post:
         *     description: Allows an action to be invoked on the remote
         *     parameters:
         *       - name: remoteId
         *         description: Unique remotes's id. Usually mac address
         *         in: formData
         *         required: false
         *         type: string
         *       - name: action
         *         description: action on the device
         *         in: formData
         *         required: false
         *         type: string
         *       - name: deviceName
         *         description: device on the remote
         *         in: formData
         *         required: false
         *         type: string
         *     responses:
         *       200:
         *         description: ok
         *       400:
         *        description: error message
         *     tags:
         *      - Remote
         */
        express.post(`${apiNamespace}/remotes/invoke`, async (req, res) => {


            const userRemotes = await User.findOne({
                where: {
                    id: req.Session.User.id
                },
                include: [
                    {
                        model: Remote,
                        where: {
                            device_id: req.body.remoteId
                        }
                    }
                ]
            });

            if (!userRemotes) {
                res.status(404);
                return res.send({
                    error: `Remote doesn't belong to user: ${req.Session.User.username}`
                });
            }

            const remote = this.socketServer.getRemote(req.body.remoteId);


            if (!remote) {
                res.status(404);
                return res.send({
                    error: 'Remote not found'
                });
            }

            let device = remote.devices.find(device => device.name === req.body.deviceName);

            if (!device) {
                res.status(404);
                return res.send({
                    error: 'Device not found'
                });
            }

            //need to be one

            let hasAction = device.actions.indexOf(req.body.action) >= 0;

            if (!hasAction) {

                res.status(404);
                return res.send({
                    error: 'Action not found'
                });

            }

            this.socketServer.getRemoteConnection(req.body.remoteId).emit('invokeAction', {
                device: req.body.deviceName,
                action: req.body.action
            });
            console.log(`Action ${req.body.action} invoked on ${req.body.remoteId} - ${req.body.deviceName}`);


            const eventName = `${req.body.remoteId}:${req.body.deviceName}:${req.body.action}`;

            let handleResponse = (state) => {

                res.send({
                    eventName: eventName,
                    state: state
                });

                this.socketServer.getRemoteConnection(req.body.remoteId).removeListener(eventName, handleResponse);
            };

            this.socketServer.getRemoteConnection(req.body.remoteId).on(eventName, handleResponse);


        });


        /**
         * @swagger
         * /remotes:
         *   get:
         *     description: List of remotes user can controll
         *     responses:
         *       200:
         *         description: list of devices
         *       400:
         *        description: error message
         *     tags:
         *      - Remote
         */
        express.get(`${apiNamespace}/remotes`, async (req, res) => {



            res.send(await this.socketServer.getEmberRemotes(req.Session.User.id))



        });


    }
}