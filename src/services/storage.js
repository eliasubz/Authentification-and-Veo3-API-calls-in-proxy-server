// services/storage.js
// Saves files to an S3-compatible bucket (Cloudflare R2) when S3_BUCKET is set, otherwise to local disk.
const fs = require('fs/promises');
const path = require('path');
const { storage } = require('../config');

let s3;
function client() {
    if (!s3) {
        const { S3Client } = require('@aws-sdk/client-s3');
        s3 = new S3Client({
            region: 'auto',
            endpoint: storage.endpoint,
            credentials: { accessKeyId: storage.accessKeyId, secretAccessKey: storage.secretAccessKey },
        });
    }
    return s3;
}

// Returns a public URL (bucket) or a server-relative path like /pets/<id>/0.jpg (local)
exports.save = async (key, buffer, contentType) => {
    if (storage.bucket) {
        const { PutObjectCommand } = require('@aws-sdk/client-s3');
        await client().send(new PutObjectCommand({ Bucket: storage.bucket, Key: key, Body: buffer, ContentType: contentType }));
        return `${storage.publicUrl.replace(/\/$/, '')}/${key}`;
    }
    const file = path.join(storage.localDir, key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, buffer);
    return `/${key}`;
};

// GPU workers can't reach this machine's disk, so local files are sent inline as base64.
exports.toWorkerInput = async (url) =>
    url.startsWith('http') ? url : (await fs.readFile(path.join(storage.localDir, url))).toString('base64');
