const { Pool } = require('pg');

// Consider moving sensitive information to environment variables
const pool = new Pool({
    host: 'localhost',
    database: '********',
    user: '********',
    password: '********',
    port: '5432',
});

const insertToDB = async (obj) => {
    const sql = `INSERT INTO public.imagery(dt, panoramaid, lat, lng, elevation, description, lang, conf, foldername, ts)
                 VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, now())`;
    const values = [
        obj.dt,
        obj.panoramaid,
        obj.lat,
        obj.lng,
        obj.elevation,
        obj.txt,
        obj.languageCode,
        obj.confidence || 0,
        obj.foldername
    ];

    try {
        await pool.query(sql, values);
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

const resultDetectText = (folder) => {
    const sql = `SELECT 
        foldername,
        panoramaid,
        SUM(CASE WHEN lang = 'ru' THEN 1 ELSE 0 END) AS ru_count,
        SUM(CASE WHEN lang = 'uk' THEN 1 ELSE 0 END) AS uk_count,
        SUM(CASE WHEN lang NOT IN ('ru', 'uk') THEN 1 ELSE 0 END) AS other_count
    FROM imagery
    WHERE foldername = $1
    GROUP BY foldername, panoramaid`;
    const values = [folder];

    try {
        return pool.query(sql, values);
    } catch (error) {
        console.error("Get result failed:", error.message);
    }
};

module.exports = {
    insertToDB,
    insertFullName,
    validateResult,
    resultDetectText
};
