import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import { AddressInfo } from 'net';
import { Server } from 'http';
import { routes } from './routes';
export class App {
    private app: express.Express;

    public constructor() {
        this.app = express();
        this.init();
        this.initRoutes();
    }

    public listen(): Server {
        const server = this.app.listen(3000, 'localhost', () => {
            const address = (server.address() as AddressInfo).address;
            const port = (server.address() as AddressInfo).port;
            console.log(`Application running on url 📡: ${address}:${port}/`);
        });
        return server;
    }

    private init() {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(bodyParser.json({ limit: '50mb' }));
    }

    private initRoutes() {
        routes.forEach((route) => {
            this.app.use(route.Router);
        });
    }
}