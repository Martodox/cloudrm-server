import express from 'express';
import swagger from 'swagger-jsdoc';
import http from 'http';
import { config } from '/services/config';
import { Session, User } from '/models/index';
import bodyParser from 'body-parser';
import cors from 'cors';

const expressServer = express();
const server = http.Server(expressServer);

const port = config['server-port'] || 3000;

const authenticatedMiddleware = (req, res, next) => {

  if (!req.headers.authorization) {
    return res.status(403).send(`Authorization token required to access ${req.method} ${req.baseUrl}`)
  }

  const token = req.headers.authorization;

  //TODO: #10 set expiry date

  Session.findOne({
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
  }).then((row, err) => {

    if (!row) {
      return res.status(403).send(`Bad token, access to ${req.method} ${req.baseUrl} not allowed`);
    }

    if (!row.User) {
      //TODO: #10 remove token from DB
      return res.status(403).send(`Orphan token, access to ${req.method} ${req.baseUrl} not allowed`);
    }

    req.Session = row;

    next();

  });


};

expressServer.use(cors());

expressServer.use('/session', (req, res, next) => {
  switch(req.method) {
    case 'GET':
    case 'DELETE':
      return authenticatedMiddleware(req, res, next);
    default:
      return next();
  }
});

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
  },
  apis: ['./src/components/**/*.js']
});

expressServer.get('/api-docs.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

expressServer.use('/docs', express.static('swagger'));


server.listen(port, () => {
  console.info(`Server had started on localhost:${port}`);
});

export {
  expressServer as express,
  server as http
}