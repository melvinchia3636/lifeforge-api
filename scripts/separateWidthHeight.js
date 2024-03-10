/* eslint-disable import/no-unresolved */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
const Pocketbase = require('pocketbase/cjs');

(async () => {
    const pb = new Pocketbase('http://192.168.0.117:8090');

    await pb.collection('users').authWithPassword('melvinchia623600@gmail.com', 'redaxe3636');

    const images = await pb.collection('photos_entry').getFullList();
    const data = await pb.collection('photos_entry_dimensions').getFullList();

    for (let i = 0; i < data.length; i += 1) {
        const item = data[i];
        await pb.collection('photos_entry_dimensions').update(item.id, {
            is_deleted: images.find((image) => image.id === item.photo).is_deleted,
            is_in_album: images.find((image) => image.id === item.photo).album !== '',
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
