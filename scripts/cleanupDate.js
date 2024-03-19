/* eslint-disable no-param-reassign */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
const Pocketbase = require('pocketbase/cjs');
const moment = require('moment');

(async () => {
    const pb = new Pocketbase('http://192.168.0.117:8090');

    await pb.collection('users').authWithPassword('melvinchia623600@gmail.com', 'redaxe3636');

    const data = await pb.collection('photos_entry_dimensions').getFullList({
        filter: "photo.name~'WA'",
        expand: 'photo',
    });

    data.forEach((photo) => {
        photo.photo = photo.expand.photo;
        delete photo.expand;

        const dateStr = photo.photo.name.toUpperCase().match(/IMG-(?<date>\d+)-WA.+/).groups.date;
        const date = moment(dateStr, 'YYYYMMDD').format('YYYY-MM-DD HH:mm:ss');

        pb.collection('photos_entry_dimensions').update(photo.id, {
            shot_time: date,
        }, {
            $autoCancel: false,
        });
    });

    // const hasDuplicates = {}

    // for (let i = 0; i < data.length; i++) {
    //     const`` item = data[i]
    //     const duplicates = data.filter(photo => photo.name === item.name)
    //     if (duplicates.length > 1) {
    //         if (!hasDuplicates[item.name]) {
    //             hasDuplicates[item.name] = duplicates
    //         }
    //     }
    // }

    // for (let item of Object.values(hasDuplicates)) {
    //     if (item.length === 2) {
    //         if (item[0].filesize === item[1].filesize) {
    //             console.log("Duplicate ", item[0].name, item[0].filesize, item[1].filesize)
    //             pb.collection("photos_entry").delete(item[1].id, {
    //                 "$autoCancel": false
    //             })
    //         }
    //     }
    // }
})();
