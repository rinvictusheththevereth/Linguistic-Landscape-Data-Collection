const { insertToDB, insertFullName } = require('./database');
const fs = require('fs').promises; // Use promise-based fs module
const vision = require('@google-cloud/vision');
const { Storage } = require('@google-cloud/storage');

const keyFilename = './api_key.json';
const storage = new Storage({ keyFilename });
const client = new vision.ImageAnnotatorClient({
    keyFilename: keyFilename
});

const listFoldersInBucket = async (bucketName) => {
    const options = {
        autoPaginate: false,
        delimiter: '/',
        prefix: '',
    };

    const [files, nextQuery, apiResponse] = await storage.bucket(bucketName).getFiles(options);
    const folders = apiResponse.prefixes;

    return folders;
}

const listAllFilesInBuckets = async (bucketName) => {
    const [files] = await storage.bucket(bucketName).getFiles();
    console.log('Files:');
    files.forEach(file => {
        console.log(file.name);
    });
}

const listFilesInSpecificFolder = async (bucketName, folderName) => {
    const options = {
        prefix: folderName,
        delimiter: '/'
    };

    const [files] = await storage.bucket(bucketName).getFiles(options);

    console.log(`Files in ${folderName}:`);
    files.forEach(file => {
        console.log(file.name);
    });
}

const detectTextFromLocalImage = async (imgfile, txtObj) => {
    try {
        const [result] = await client.textDetection(imgfile);
        const blocks = result.fullTextAnnotation.pages[0].blocks;

        for (const block of blocks) {
            for (const paragraph of block.paragraphs) {
                for (const word of paragraph.words) {
                    let txt = word.symbols.map(symbol => symbol.text).join('');
                    let languageCode = word.property?.detectedLanguages[0].languageCode || '';
                    let confidence = word.property?.detectedLanguages[0].confidence || 0;

                    if (!["Google", "Ⓒ2020", "Ⓒ2022", "@", "©", "Googlo", "Goog", "ogle"].includes(txt)) {
                        let allData = { ...txtObj, txt, languageCode, confidence };
                        await insertToDB(allData);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error in getTextFromGSV:", error);
    }
};

async function detectTextFromBucketImage(gcsUri, txtObj) {
    try {
        const [result] = await client.textDetection(gcsUri);
        const blocks = result.fullTextAnnotation.pages[0].blocks;

        for (const block of blocks) {
            for (const paragraph of block.paragraphs) {
                for (const word of paragraph.words) {
                    let txt = word.symbols.map(symbol => symbol.text).join('');
                    let languageCode = word.property?.detectedLanguages[0].languageCode || '';
                    let confidence = word.property?.detectedLanguages[0].confidence || 0;

                    if (!["Google", "Ⓒ2020", "Ⓒ2022", "@", "©", "Googlo", "Goog", "ogle"].includes(txt)) {
                        let allData = { ...txtObj, txt, languageCode, confidence };
                        await insertToDB(allData);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error in getTextFromGSV:", error);
    }
}

const readLocalImages = async (path) => {
    try {
        const files = await fs.readdir(path);
        let i = 1;
        for (const file of files) {
            if (file.endsWith('.jpg')) {
                const item = file.replace('.jpg', '');
                const [dt, panoramaid, lat, long, elevation] = item.split(',');
                const txtObj = { dt, panoramaid, lat, long, elevation };
                await insertFullName(item, panoramaid);
                await detectTextFromLocalImage(`${path}/${file}`, txtObj);
                console.log(i, txtObj);
                i++;
            }
        }
        console.log('finished reading images');
    } catch (error) {
        console.error("Error reading images:", error);
    }
};

const readBucketImages = async (bucketName, folderName) => {
    try {
        const [files] = await storage.bucket(bucketName).getFiles({ prefix: folderName });
        let i = 1;
        for (const file of files) {
            const gcsUri = `gs://${file.parent.name}/${file.name}`;
            if (file.name.endsWith('.jpg')) {
                const f = file.name.replace(folderName, '');
                const item = f.replace('.jpg', '');
                const [dt, panoramaid, lat, long, elevation] = item.split(',');
                const txtObj = { dt, panoramaid, lat, long, elevation };
                await insertFullName(item, panoramaid);
                await detectTextFromBucketImage(gcsUri, txtObj);
                console.log(i, txtObj);
                i++;
            }
        }
        console.log('finished reading images');
    } catch (error) {
        console.error("Error reading images:", error);
    }
};

module.exports = {
    insertFullName,
    readLocalImages,
    readBucketImages,
    listFoldersInBucket,
    listAllFilesInBuckets,
    listFilesInSpecificFolder
};
