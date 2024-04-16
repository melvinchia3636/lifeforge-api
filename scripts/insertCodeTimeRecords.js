/* eslint-disable import/no-unresolved */
/* eslint-disable no-await-in-loop */
const Pocketbase = require('pocketbase/cjs');
const csv = require('csv-parser');
const fs = require('fs');

const pocketbase = new Pocketbase('http://192.168.0.106:8090');

const results = [];

fs.createReadStream('records.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
        for (let i = 0; i < results.length; i += 50) {
            const records = results.slice(i, i + 50);
            const promises = records.map((record) => pocketbase.collection('code_time').create(record, {
                $autoCancel: false,
            }));
            await Promise.all(promises);
            console.log(`Inserted ${i + 50} records`);
        }
    });
