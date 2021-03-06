import express from 'express';
import swagger from 'swagger-jsdoc';
import http from 'http';
import {config, localConfig} from '/services/config';
import {Session, User} from '/models/index';
import bodyParser from 'body-parser';
import cors from 'cors';
import moment from 'moment';

const TOKEN_VALID_MAX_DAYS = 5;
const expressServer = express();
const server = http.Server(expressServer);

const apiNamespace = localConfig.apiPath;

const port = config['server-port'] || 3000;

const authenticatedMiddleware = async (req, res, next) => {

    if (!req.headers.token) {
        return res.status(403).send({error: `Authorization token required to access ${req.method} ${req.baseUrl}`});
    }

    const token = req.headers.token;

    const session = await Session.findOne({
        where: {
            token: token
        },
        include: [
            {
                model: User,
                attributes: {
                    exclude: ['password']
                }
            }
        ]
    });

    if (!session) {
        return res.status(403).send({error: `Bad token, access to ${req.method} ${req.baseUrl} not allowed`});
    }

    let createdAt = moment(session.updatedAt);

    let tokenAge = moment.duration(moment().diff(createdAt)).asDays();

    if (tokenAge > TOKEN_VALID_MAX_DAYS) {
        session.destroy();
        return res.status(403).send({error: `Token expired, access to ${req.method} ${req.baseUrl} not allowed`});
    }

    if (!session.User) {
        session.destroy();
        return res.status(403).send({error: `Orphan token, access to ${req.method} ${req.baseUrl} not allowed`});
    }

    if (tokenAge > TOKEN_VALID_MAX_DAYS - 1) {
        session.changed('updatedAt', true);
        await session.update({
            'updatedAt': new Date()
        });
    }

    req.Session = session;

    next();


};

expressServer.use(cors());

expressServer.use(bodyParser.urlencoded({
    extended: true
}));

expressServer.use(bodyParser.json());

const swaggerSpec = swagger({
    swaggerDefinition: {
        info: {
            title: 'Cloudrm',
            version: '1.0.0',
        },
        basePath: apiNamespace + '/',
        produces: ['application/json'],
        consumes: ['application/json']
    },
    apis: ['./src/**/*.js']
});

expressServer.get('/api-docs.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

expressServer.use('/', express.static('swagger'));


server.listen(port, () => {
    console.info(`Server had started on localhost:${port}`);
});

export {
    expressServer as express,
    server as http,
    authenticatedMiddleware as authenticatedMiddleware
}