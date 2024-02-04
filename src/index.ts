import express from 'express';
import { deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo } from './storage';
import { convertVideo } from './processing';

const app = express();
app.use(express.json());


app.post('/process-video', async (req, res) => {
    let data;

    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
        
        data = JSON.parse(message);

        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }

    } catch (err) {
        console.error('Error processing video:', err);
        return res.status(400).send('Bad Request: missing name.')
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    await downloadRawVideo(inputFileName);

    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (err) {
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteRawVideo(outputFileName)
        ]);

        console.error(err);

        return res.status(500).send('Internal server error: video processing failed.');
    }

    await uploadProcessedVideo(outputFileName);

    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);

    return res.status(200).send('Video processed successfully.');

})

// Cloud Run automatically sets the PORT environment variable to 8080
const port = process.env.PORT || 3000;

app.listen(port, () => {
    setupDirectories();
    console.log('Video Processing Service started!')
})