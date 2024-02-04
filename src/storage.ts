import { Storage } from '@google-cloud/storage'
import fs from 'fs';

const storage = new Storage();

const rawVideoBucketName = 'vbrodrigues-yt-raw-videos';
const processedVideoBucketName = 'vbrodrigues-yt-processed-videos';

export const localRawVideoPath = './raw-videos';
export const localProcessedVideoPath = './processed-videos';

export function setupDirectories() {
    createDirectory(localRawVideoPath);
    createDirectory(localProcessedVideoPath);
}

export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({ destination: `${localRawVideoPath}/${fileName}` });

    console.log(`Downloaded gs://${rawVideoBucketName}/${fileName} to ${localRawVideoPath}/${fileName}`);
}

export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });

    // Even if we made the processed bucket a public bucket, we still need to make the file itself public explicitly
    await bucket.file(fileName).makePublic();

    console.log(`Uploaded ${localProcessedVideoPath}/${fileName} to gs://${processedVideoBucketName}/${fileName}`);
}

function deleteLocalFile(filePath: string) {
    return new Promise<void>((resolve, reject) => {
        if (fs.existsSync(filePath)){
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}.`, err);
                    reject(err);
                } else {
                    console.log(`Deleted file ${filePath}.`);
                    resolve();
                }
            })
        } else {
            console.log(`File ${filePath} does not exist.`);
            resolve()
        }
    })
}

export function deleteRawVideo(fileName: string) {
    return deleteLocalFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProcessedVideo(fileName: string) {
    return deleteLocalFile(`${localProcessedVideoPath}/${fileName}`);
}

function createDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
        console.log(`Directory ${dirPath} created.`);
    }
}