/* eslint-disable max-len */
const { exec } = require('child_process');

exec('cd /media/melvin/git/lifeforge.git && git ls-tree --full-tree -r --name-only main', (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    const files = stdout.split('\n').filter((e) => e);

    const tree = {
        path: '/',
        directories: [],
        files: [],
    };

    files.forEach((file) => {
        const parts = file.split('/');
        let currentDirectory = tree;

        for (let i = 0; i < parts.length; i++) {
            if (i === parts.length - 1) {
                currentDirectory.files.push(parts[i]);
            } else {
                let foundDirectory = currentDirectory.directories.find((dir) => dir.path === parts[i]);

                if (!foundDirectory) {
                    foundDirectory = {
                        path: parts[i],
                        directories: [],
                        files: [],
                    };
                    currentDirectory.directories.push(foundDirectory);
                }

                currentDirectory = foundDirectory;
            }
        }
    });

    console.log(tree.directories[1]);
});
