/* eslint-disable import/no-unresolved */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
const Pocketbase = require('pocketbase/cjs');

(async () => {
    const pb = new Pocketbase('http://192.168.0.117:8091');

    await pb.collection('users').authWithPassword('kelvinchia56@gmail.com', 'Kelvin9800');

    const images = await pb.collection('photos_entry').getFullList();

    for (let i = 0; i < images.length; i += 1) {
        const item = images[i];
        await pb.collection('photos_entry_dimensions').create({
            photo: item.id,
            width: item.width,
            height: item.height,
            shot_time: item.shot_time,
            is_deleted: item.is_deleted,
            is_in_album: item.album !== '',
        }, {
            $autoCancel: false,
        });
    }

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
