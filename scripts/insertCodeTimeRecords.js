const Pocketbase = require('pocketbase/cjs');
const csv = require('csv-parser');
const fs = require('fs')

const pocketbase = new Pocketbase("http://127.0.0.1:8090");

const results = [];

fs.createReadStream('records.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
        for (let i = 0; i < results.length; i += 50) {
            const records = results.slice(i, i + 50);
            const promises = records.map((record) => {
                return pocketbase.collection("code_time").create(record, {
                    '$autoCancel': false,
                });
            })
            await Promise.all(promises);
            console.log(`Inserted ${i + 50} records`);
        }

    });