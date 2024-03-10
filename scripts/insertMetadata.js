/* eslint-disable import/no-unresolved */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
const Pocketbase = require('pocketbase/cjs');
const fs = require('fs');
const ExifReader = require('exifreader');
const moment = require('moment');

(async () => {
    const pb = new Pocketbase('http://192.168.0.117:8091');

    await pb.collection('users').authWithPassword('kelvinchia56@gmail.com', 'Kelvin9800');

    const data = await pb.collection('photos_entry').getFullList({
        filter: 'filesize=0',
    });

    for (let i = 0; i < data.length; i += 1) {
        const item = data[i];
        if (item.image) {
            const file = `/media/${process.env.DATABASE_OWNER}/database/pb_data/storage/${item.collectionId}/${item.id}/${item.image}`;
            if (fs.existsSync(file)) {
                const filesize = fs.statSync(file).size;
                const tags = await ExifReader.load(file);
                const shotTime = moment(tags.DateTimeOriginal.value, 'YYYY:MM:DD HH:mm:ss').toISOString();
                const width = tags.Orientation.value === 6 || tags.Orientation.value === 8 ? tags.PixelYDimension.value : tags.PixelXDimension.value;
                const height = tags.Orientation.value === 6 || tags.Orientation.value === 8 ? tags.PixelXDimension.value : tags.PixelYDimension.value;

                pb.collection('photos_entry').update(item.id, {
                    filesize,
                    shot_time: shotTime,
                    width,
                    height,
                }, {
                    $autoCancel: false,
                });

                console.log(i);
            }
        }
    }

    // const hasDuplicates = {}

    // for (let i = 0; i < data.length; i++) {
    //     const item = data[i]
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
