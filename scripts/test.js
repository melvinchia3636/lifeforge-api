/* eslint-disable import/no-unresolved */
/* eslint-disable no-restricted-syntax */
const Pocketbase = require('pocketbase/cjs');

const pb = new Pocketbase('http://127.0.0.1:8090');
(async () => {
    const records = await pb.collection('code_time').getFullList({
        sort: 'event_time',
    });
    const groupByLanguage = {};
    for (const item of records) {
        if (!groupByLanguage[item.language]) {
            groupByLanguage[item.language] = [];
        }
        groupByLanguage[item.language].push(item);
    }
    Object.entries(groupByLanguage).forEach(([name, items]) => {
        pb.collection('code_time_languages').create({
            name,
            duration: items.length,
        }, {
            $autoCancel: false,
        });
    });
})();
