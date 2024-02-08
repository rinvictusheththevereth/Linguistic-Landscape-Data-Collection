const express = require('express')
const app = express()
const fs = require('fs')
const vision = require('@google-cloud/vision');
const { Pool } = require('pg');
const { log } = require('console');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'nihilstate14135*',
  port: '5433'
})

const port = 3000

function insertToDB(obj) {
  if (obj.confidence) {
    const sql = `INSERT INTO public.imagery(dt,panoramaid,lat,long,elevation,description,lang,conf,ts)VALUES(
      ${obj.dt},'${obj.panoramaid}',${obj.lat},${obj.long},${obj.elevation},'${obj.txt}','${obj.languageCode}',${obj.confidence}, now())`;
    console.log(sql)
    pool.query(sql).then(i => {
      console.log("success!");
    })
  } else {
    const sql = `INSERT INTO public.imagery(dt,panoramaid,lat,long,elevation,description,lang,conf,ts)VALUES(
      ${obj.dt},'${obj.panoramaid}',${obj.lat},${obj.long},${obj.elevation},'${obj.txt}','${obj.languageCode}',0, now())`;
    console.log(sql)
    pool.query(sql).then(i => {
      console.log("success!");
    })
  }
}

async function getTextFromGSV(imgfile, txtObj) {
  console.log(imgfile, txtObj);
  return new Promise(async (resolve, reject) => {
    const client = new vision.ImageAnnotatorClient({
      keyFilename: './api_key.json'
    });
    const [result] = await client.textDetection(imgfile);

    result.fullTextAnnotation.pages[0].blocks
      .map(paragraphs => paragraphs.paragraphs)
      .map(words => {
        words.forEach(items => {
          items.words.forEach(i => {
            let txt = '';
            let languageCode = '';
            let confidence = '';
            i.symbols.forEach(i => { txt += i.text })

            if (i.property != null) {
              languageCode = i.property.detectedLanguages[0].languageCode;
              confidence = i.property.detectedLanguages[0].confidence;
            }

            if (txt !== 'Google' && txt !== 'Ⓒ2020' && txt !== 'Ⓒ2022' && txt !== '@' && txt !== '©' && txt !== 'Googlo' && txt !== 'Goog' && txt !== 'ogle') {
              let allData = { ...txtObj, txt, languageCode, confidence };
              insertToDB(allData);
            }
            // console.log(allData);
          })
        })
      })
  })
}


function insertFullName(fullName, panoramaid) {
  const sql = `INSERT INTO allimages(fullname, panoramaid, ts)VALUES('${fullName}','${panoramaid}', now())`
  pool.query(sql).then(() => {
    console.log('insert fullName success!')
  })
}

function readImages(path) {
  fs.readdir(path, (err, fname) => {
    const fnameArr = fname.map(item => item.replace('.jpg', ''))
    fnameArr.forEach(async item => {
      try {
        let txtArr = item.split(',');
        let txtObj = {
          dt: txtArr[0],
          panoramaid: txtArr[1],
          lat: txtArr[2],
          long: txtArr[3],
          elevation: txtArr[4],
        }
        insertFullName(item, txtArr[1]);
        await getTextFromGSV(`./${path}/${item}.jpg`, txtObj);
      } catch (error) {
        console.log(error);
      }
    });
  })
}

// const imgfile = '201110,sX1o6rAW5QLWxG5NfcNhsw,50.43672589,30.54076677,0193.jpg';
readImages('./kyiv1/j');


// get data from database
app.get('/getdata/', async (req, res) => {
  const sql = 'SELECT * FROM public.imagery';
  pool.query(sql).then(item => {
    res.json(item.rows[0])
  })
})

// app.get('/', async (req, res) => {
//   let data = await quickstart()
//   res.json(data)
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
