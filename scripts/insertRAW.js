/* eslint-disable import/no-unresolved */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const Pocketbase = require('pocketbase/cjs');
const fs = require('fs');

(async () => {
    const pb = new Pocketbase('http://192.168.0.117:8090');

    await pb.collection('users').authWithPassword('melvinchia623600@gmail.com', 'redaxe3636');

    const data = await pb.collection('photos_entry').getFullList({
        filter: "raw='' && shot_time>'2024-03-03 16:00:00' && shot_time<'2024-03-04 16:00:00'",
    });

    for (const item of data) {
        const { name } = item;
        try {
            const raw = fs.readFileSync(`/media/${process.env.DATABASE_OWNER}/uploads/${name}.CR3`);
            const file = new File([raw], `${name}.CR3`);

            await pb.collection('photos_entry').update(item.id, {
                raw: file,
            });

            console.log(`Updated: ${item.name}`);
        } catch (e) {
            console.log(`Error: ${item.name}`);
        }
    }
})();
