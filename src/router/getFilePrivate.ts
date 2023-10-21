import { BlobServiceClient } from '@azure/storage-blob';
import { IncomingMessage, ServerResponse } from 'http';

const ACCOUNT_NAME = process.env.ACCOUNT_NAME;
const PRIVATE_CONTAINER_NAME = process.env.PRIVATE_CONTAINER_NAME;
const START_DATE = parseInt(process.env.START_DATE);
const END_DATE = parseInt(process.env.END_DATE);

const ENCODED_START_DATE = encodeURIComponent(
    new Date(START_DATE).toISOString().split('.')[0] + 'Z',
);
const ENCODED_END_DATE = encodeURIComponent(new Date(END_DATE).toISOString().split('.')[0] + 'Z');
const SAS_PREFIX = `sv=2023-08-03&spr=https&st=${ENCODED_START_DATE}&se=${ENCODED_END_DATE}&sr=b&sp=r`;

export async function getFilePrivate(
    req: IncomingMessage,
    res: ServerResponse,
    meta: { sig: string; name: string },
) {
    try {
        const blobServiceClient = new BlobServiceClient(
            `https://${ACCOUNT_NAME}.blob.core.windows.net?${SAS_PREFIX}&sig=${meta.sig}`,
            null,
        );
        const containerName = PRIVATE_CONTAINER_NAME;
        const blobName = meta.name;

        const containerClient = await blobServiceClient.getContainerClient(containerName);

        const blobClient = await containerClient.getBlockBlobClient(blobName);
        const downloadResponse = await blobClient.download();

        downloadResponse.readableStreamBody.pipe(res);
    } catch (err) {
        res.writeHead(err.statusCode || 500, { 'Content-Type': 'text/plain' });
        res.end(err.toString());
    }
}
