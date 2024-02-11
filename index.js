const express = require('express');
const app = express();

const { readLocalImages,
  readBucketImages,
  listFoldersInBucket,
  listAllFilesInBuckets,
  listFilesInSpecificFolder,
  numberOfFilesInFolder } = require('./extractFunction');
const { validateResult, resultDetectText } = require('./database');

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

app.get('/numberOfFilesInSpecificFolder/:folderName', async (req, res) => {
  const folderName = req.params.folderName;
  console.log(folderName);
  try {
    const result = await numberOfFilesInFolder(bucketName, folderName + '/');
    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error in listFilesInSpecificFolder:", error);
  }
})

app.get('/numberOfFilesInSpecificFolder/:folderName', async (req, res) => {
  const folderName = req.params.folderName;
  console.log(folderName);
  try {
    const result = await numberOfFilesInFolder(bucketName, folderName + '/');
    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Error in listFilesInSpecificFolder:", error);
  }
})

app.get('/detectText/:folderName', async (req, res) => {
  const folderName = req.params.folderName;
  console.log(folderName);
  try {
    const result = await readBucketImages(bucketName, folderName + '/');
    if (result.success) {
      let resultText = await resultDetectText(folderName + '/');
      res.status(200).json({ status: "success", data: resultText.rows });
    } else {
      res.status(500).json({ status: "error", message: result.error });
    }
  } catch (error) {
    console.error("Error in listFilesInSpecificFolder:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
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
