import { IncomingMessage, ServerResponse } from 'http';
import axios from 'axios';

const ACCOUNT_NAME = process.env.ACCOUNT_NAME;
const PUBLIC_CONTAINER_NAME = process.env.PUBLIC_CONTAINER_NAME;

export async function getFile(req: IncomingMessage, res: ServerResponse, meta: { name: string }) {
    try {
        const axiosResponse = await axios.get(
            `https://${ACCOUNT_NAME}.blob.core.windows.net/${PUBLIC_CONTAINER_NAME}/${meta.name}`,
            {
                responseType: 'stream',
            },
        );
        res.setHeader('Content-Type', axiosResponse.headers['content-type']);
        res.setHeader('Content-Length', axiosResponse.headers['content-length']);

        axiosResponse.data.pipe(res);
    } catch (err) {
        res.writeHead(err.response!.status || 500, { 'Content-Type': 'text/plain' });
        res.end(err.message);
    }
}
