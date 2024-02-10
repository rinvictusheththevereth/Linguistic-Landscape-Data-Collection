const express = require('express')
const app = express()

const { readLocalImages, readBucketImages, listAllFilesInBuckets, listFilesInSpecificFolder } = require('./extractFunction')
const { validateResult } = require('./database')

// get data from database
app.get('/getdata/', async (req, res) => {
  const sql = 'SELECT * FROM public.imagery';
  pool.query(sql).then(item => {
    res.json(item.rows[0])
  })
})

app.get('/validateresult/', async (req, res) => {
  try {
    const result = await validateResult();
    res.json(result.rows);
  } catch (error) {
    console.error("Error in validateResult:", error);
  }
})

app.get('/', async (req, res) => {
  res.json({ data: 'Hello World' })
})

// insert folder name here
// listAllFilesInBuckets('imagery-kyiv-pelagic-radio-355403/TEST_FOLDER');
// listFilesInSpecificFolder('imagery-kyiv-pelagic-radio-355403', 'TEST_FOLDER/');

// readLocalImages('./test_images');
readBucketImages('imagery-kyiv-pelagic-radio-355403', 'B/');

const port = 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
