const express = require('express');
const app = express();

const { readLocalImages,
  readBucketImages,
  listFoldersInBucket,
  listAllFilesInBuckets,
  listFilesInSpecificFolder } = require('./extractFunction');
const { validateResult } = require('./database');

const bucketName = 'imagery-kyiv-pelagic-radio-355403';

// get data from database
app.get('/getdata', async (req, res) => {
  const sql = 'SELECT * FROM public.imagery';
  pool.query(sql).then(item => {
    res.json(item.rows[0])
  })
})

app.get('/validateresult', async (req, res) => {
  try {
    const result = await validateResult();
    res.json(result.rows);
  } catch (error) {
    console.error("Error in validateResult:", error);
  }
})

app.get('/listFoldersInBucket', async (req, res) => {
  try {
    const result = await listFoldersInBucket(bucketName);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in listFoldersInBucket:", error);
  }
})

app.get('/listFilesInSpecificFolder', async (req, res) => {
  const folderName = req.query.folderName;
  try {
    const result = await listFilesInSpecificFolder(bucketName, folderName + '/');
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in listFilesInSpecificFolder:", error);
  }
})

app.use('/', express.static('www'))

// insert folder name here
// listAllFilesInBuckets('imagery-kyiv-pelagic-radio-355403/TEST_FOLDER');
// listFilesInSpecificFolder(bucketName, 'TEST_FOLDER/');

// readLocalImages('./test_images');
// readBucketImages(bucketName, 'B/');

const port = 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
