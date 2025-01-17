import express from 'express';
import helmet from 'helmet';
// import cors from 'cors';
import { AddressInfo } from 'net';
import { Server } from 'http';
import { routes } from './routes';
import { routeErrorHandler, unhandledErrorHandler, apiErrorHandler } from './middlewares';
import { join } from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { apiDefintion } from './config/swagger-config';
// import { DomainRestrictedException } from './error/domain-restricted-exception';


export class App {
    private app: express.Express;
    public constructor() {
        this.app = express();
        this.init();
        this.initRoutes();
        this.initErrorMiddlewares();
    }

    public listen(): Server {
        const server = this.app.listen(3000, 'localhost', () => {
            const address = (server.address() as AddressInfo).address;
            const port = (server.address() as AddressInfo).port;
            console.log(`Application running on url 📡: http://${address}:${port}/`);
            console.log(`Api documentation running on url 📡: http://${address}:${port}/api-docs/`);
        });
        return server;
    }

    private init() {
        this.app.use(helmet());
        // this.app.use(
        //     cors((request, callback) => {
        //         const whiteList = process.env.DOMAIN_WHITE_LIST.split(',').map(str =>
        //             str.trim(),
        //           );
        //         const origin = request.headers.origin;
        //         if (whiteList.indexOf(origin) !== -1 || !origin) {
        //             callback(null, {
        //                 origin: true
        //             })
        //         } else {
        //             callback(
        //                 new DomainRestrictedException(origin)
        //             );
        //         }
        //     })
        // );
        this.app.use(express.json({ limit: '50mb' }));
        this.app.get('/',(request,response)=>{
            response.status(200).send({
                message: 'Welcome'
            });
        });
        const apiDocsPath = join(__dirname, '../api-docs');
        this.app.get('/api-docs', express.static(apiDocsPath));
        this.app.get('/swagger.json', (request, response, next) => {
            try {
                response.setHeader('Content-Type', 'application/json');
                const swaggerSpec = swaggerJsdoc({
                    swaggerDefinition: {
                        ...apiDefintion
                    },
                    apis: ['./src/app/routes/**/*.{js,ts}']
                });
                response.send(swaggerSpec);
            } catch (e) {
                next(e);
            }
        });
    }

    private initRoutes() {
        routes.forEach((route) => {
            this.app.use(route.Router);
        });
        this.app.use(routeErrorHandler);
    }

    private initErrorMiddlewares() {
        this.app.use(apiErrorHandler);
        this.app.use(unhandledErrorHandler);
    }

}