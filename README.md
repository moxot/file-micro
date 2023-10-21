## Overview

Test simple node.js "microservice" to store user-uploaded files in 
Azure blob storage service. 

Security might be an issue, but for simplicity’s sake, and to keep
it as thin as possible, used SAS tokens in order not to store extra data
on microservice side. Files are streamed to and form
Azure blob storage. Did not overly complicate, therefore SAS string 
gets hardcoded dates and version, ttl for SAS token is 100 years, 
simplistic router, basic error handling without debugging info and errors are returned to client. 
For same reasons and because I was asked to send a folder - no deployment of any sort.

## Routes

- **POST /upload**: expects multipart/form-data file/s.
- **POST /upload/private**: expects multipart/form-data file/s.
- **GET /fileName**: expects file name returned by POST /upload.
- **GET /token/fileName**: expects token and file name returned by POST /upload/private.

## Installation and Setup

### Installing

```bash
npm install
```

### Setup

- Create .env file:
```bash
cp .env.example .env
```
- Create public and private containers in Azure blob storage
- Populate .env file with Azure specific values: 
connection string, account name, account key, private and public container names

## Run the application
```bash
npm run build && npm start
```
