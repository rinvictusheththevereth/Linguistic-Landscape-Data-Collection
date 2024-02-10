const { Pool } = require('pg');

// Consider moving sensitive information to environment variables
const pool = new Pool({
    host: 'localhost',
    database: 'langland',
    user: 'sakdahomhuan',
    password: '1234',
    port: '5432',
});

const insertToDB = async (obj) => {
    const sql = `INSERT INTO public.imagery(dt, panoramaid, lat, lng, elevation, description, lang, conf, ts)
                 VALUES($1, $2, $3, $4, $5, $6, $7, $8, now())`;
    const values = [
        obj.dt,
        obj.panoramaid,
        obj.lat,
        obj.long,
        obj.elevation,
        obj.txt,
        obj.languageCode,
        obj.confidence || 0
    ];

    try {
        await pool.query(sql, values);
        // console.log("Insert success!");
    } catch (error) {
        console.error("Insert failed:", error.message);
    }
};

const insertFullName = async (fullName, panoramaid) => {
    const sql = `INSERT INTO allimages(fullname, panoramaid, ts) VALUES($1, $2, now())`;
    const values = [fullName, panoramaid];

    try {
        await pool.query(sql, values);
        console.log('Insert fullName success!');
    } catch (error) {
        console.error("Insert fullName failed:", error.message);
    }
};

const validateResult = (result) => {
    const sql = `WITH img(pano) As (
        SELECT DISTINCT panoramaid FROM imagery
    )
    SELECT allimg.panoramaid as fileinfolder, img.pano as fileextracted
    FROM allimages allimg
    LEFT JOIN img
    ON allimg.panoramaid = img.pano`

    try {
        return pool.query(sql);
    } catch (error) {
        console.error("Validate result failed:", error.message);
    }
};

module.exports = {
    insertToDB,
    insertFullName,
    validateResult
};
