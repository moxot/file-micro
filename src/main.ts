import { config } from 'dotenv';
config();

import { createServer, ServerResponse, IncomingMessage } from 'http';
import { Router } from './router/router';

const router = new Router();
const regex = /^\/([^\/]+)(?:\/([^\/]+))?$/;
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const { method, url, headers } = req;
        const parsedURL = new URL(url, `http://${headers.host}`);
        switch (method) {
            case 'GET': {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [_, p1, p2] = parsedURL.pathname.match(regex);
                if (p1 && p2) {
                    await router.getFilePrivate(req, res, {
                        sig: p1,
                        name: p2,
                    });
                } else if (p1) {
                    await router.getFile(req, res, {
                        name: p1,
                    });
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
                break;
            }
            case 'POST': {
                if (parsedURL.pathname === '/upload') {
                    return router.uploadFiles(req, res);
                } else if (parsedURL.pathname === '/upload/private') {
                    return router.uploadFilesPrivate(req, res);
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
                break;
            }
            default: {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        }
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});

server.listen(parseInt(process.env.PORT), () => {});
