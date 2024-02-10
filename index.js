const express = require('express')
const app = express()

const { readImages } = require('./extractFunction')
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
// readImages('./test_images');

const port = 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
