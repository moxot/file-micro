import { uploadFiles } from './uploadFiles';
import { uploadFilesPrivate } from './uploadFilesPrivate';
import { getFilePrivate } from './getFilePrivate';
import { getFile } from './getFile';
import { IncomingMessage, ServerResponse } from 'http';

export class Router {
    uploadFiles: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
    uploadFilesPrivate: (
        req: IncomingMessage,
        res: ServerResponse,
    ) => Promise<void>;
    getFilePrivate: (
        req: IncomingMessage,
        res: ServerResponse,
        meta: { sig: string; name: string },
    ) => Promise<void>;
    getFile: (
        req: IncomingMessage,
        res: ServerResponse,
        meta: { name: string },
    ) => Promise<void>;
    constructor() {
        this.uploadFiles = uploadFiles;
        this.uploadFilesPrivate = uploadFilesPrivate;
        this.getFilePrivate = getFilePrivate;
        this.getFile = getFile;
    }
}
