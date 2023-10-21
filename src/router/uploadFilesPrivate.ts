import * as busboy from 'busboy';
import {
    BlobSASPermissions,
    BlockBlobClient,
    generateBlobSASQueryParameters,
    RestError,
    SASProtocol,
    StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { randomUUID } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';

const CONNECTION_STRING = process.env.CONNECTION_STRING;
const ACCOUNT_NAME = process.env.ACCOUNT_NAME;
const ACCOUNT_KEY = process.env.ACCOUNT_KEY;
const PRIVATE_CONTAINER_NAME = process.env.PRIVATE_CONTAINER_NAME;
const START_DATE = parseInt(process.env.START_DATE);
const END_DATE = parseInt(process.env.END_DATE);

export async function uploadFilesPrivate(req: IncomingMessage, res: ServerResponse) {
    try {
        const bus = busboy({ headers: req.headers });
        const sharedKeyCredential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);

        const blobName = randomUUID();

        const result: Array<{ token: string; fileName: string }> = [];

        bus.on('file', async (name, file, info) => {
            try {
                const sasOptions = {
                    containerName: PRIVATE_CONTAINER_NAME,
                    blobName: blobName,
                    startsOn: new Date(START_DATE),
                    expiresOn: new Date(END_DATE),
                    permissions: BlobSASPermissions.parse('r'),
                    protocol: SASProtocol.Https,
                };

                const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential);
                result.push({
                    token: encodeURIComponent(sasToken.signature),
                    fileName: blobName,
                });
                const { mimeType } = info;
                const blockBlobClient = new BlockBlobClient(
                    CONNECTION_STRING,
                    PRIVATE_CONTAINER_NAME,
                    blobName,
                );
                await blockBlobClient.uploadStream(file, undefined, undefined, {
                    blobHTTPHeaders: {
                        blobContentType: mimeType,
                    },
                });
            } catch (err) {
                res.writeHead(err.statusCode || 500, { 'Content-Type': 'text/plain' });
                res.end(err.toString());
            }
        });

        bus.on('finish', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        });

        bus.on('error', (err: RestError) => {
            res.writeHead(err.statusCode || 500, { 'Content-Type': 'text/plain' });
            res.end(err.toString());
        });

        req.pipe(bus);
    } catch (err) {
        res.writeHead(err.statusCode || 500, { 'Content-Type': 'text/plain' });
        res.end(err.toString());
    }
}
