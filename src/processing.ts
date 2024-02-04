
import ffmpeg from 'fluent-ffmpeg';
import { localProcessedVideoPath, localRawVideoPath } from './storage';

export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
            .outputOptions('-vf', 'scale=-1:360')
            .on('end', () => {
                console.log('Video processing finished successfully.');
                resolve();
            })
            .on('error', (err) => {
                console.error('An error ocurred.', err);
                reject(err);
            })
            .save(`${localProcessedVideoPath}/${processedVideoName}`);
    })
}
