const { insertToDB, insertFullName } = require('./database');
const fs = require('fs').promises; // Use promise-based fs module
const vision = require('@google-cloud/vision');

const getTextFromGSV = async (imgfile, txtObj) => {
    try {
        const client = new vision.ImageAnnotatorClient({
            keyFilename: './api_key.json'
        });
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

const readImages = async (path) => {
    try {
        const files = await fs.readdir(path);
        let i = 1;
        for (const file of files) {
            if (file.endsWith('.jpg')) { // Ensure only jpg files are processed
                const item = file.replace('.jpg', '');
                const [dt, panoramaid, lat, long, elevation] = item.split(',');
                const txtObj = { dt, panoramaid, lat, long, elevation };
                await insertFullName(item, panoramaid); // Assuming this is also async
                await getTextFromGSV(`${path}/${file}`, txtObj);
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
    getTextFromGSV,
    insertFullName,
    readImages
};
