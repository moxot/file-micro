import * as busboy from 'busboy';
import { BlockBlobClient } from '@azure/storage-blob';
import { randomUUID } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';

const CONNECTION_STRING = process.env.CONNECTION_STRING;
const PUBLIC_CONTAINER_NAME = process.env.PUBLIC_CONTAINER_NAME;

export async function uploadFiles(req: IncomingMessage, res: ServerResponse) {
    try {
        const bus = busboy({ headers: req.headers });
        const result: { fileName: string } = { fileName: null };

        bus.on('file', async (name, file, info) => {
            try {
                const blobName = randomUUID();
                result.fileName = blobName;
                const { mimeType } = info;
                const blockBlobClient = new BlockBlobClient(
                    CONNECTION_STRING,
                    PUBLIC_CONTAINER_NAME,
                    blobName,
                );

                await blockBlobClient.uploadStream(file, undefined, undefined, {
                    blobHTTPHeaders: {
                        blobContentType: mimeType,
                    },
                });
            } catch (err) {
                console.error(err);
                res.writeHead(err.statusCode || 500, { 'Content-Type': 'text/plain' });
                res.end(err.toString());
            }
        });

        bus.on('finish', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        });

        req.pipe(bus);
    } catch (err) {
        res.writeHead(err.statusCode || 500, { 'Content-Type': 'text/plain' });
        res.end(err.toString());
    }
}
