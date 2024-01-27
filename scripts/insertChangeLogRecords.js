const Pocketbase = require('pocketbase/cjs');

const data = [
    [
        "Idea Box", "Containers and ideas data synced to database, no more dummy data."
    ],
    [
        "Idea Box", "Create, update, and delete containers and ideas from the UI."
    ],
    [
        "Idea Box", "Search containers and ideas."
    ],
    [
        "Idea Box", "Zoom image by clicking on it."
    ],
    [
        "Idea Box", "Pin ideas to the top."
    ],
    [
        "Change Log", "Added this change log with naming convention of{' '} <code className=\"inline-block rounded-md bg-neutral-200 p-1 px-1.5 font-['Jetbrains_Mono', text-sm shadow-[2px_2px_2px_rgba(0,0,0,0.05), dark:bg-neutral-800\"> Ver. [year,w[week number, </code>"
    ],
    [
        "API", "Added API explorer at the root of the API."
    ],
    [
        "API", "Integrated Code Time API into the main API."
    ],
    [
        "UI", "Added backdrop blur when modals are open."
    ],
    [
        "Code Refactor", "Moved API host into{' '} <code className=\"inline-block rounded-md bg-neutral-200 p-1 px-1.5 font-['Jetbrains_Mono', text-sm shadow-[2px_2px_2px_rgba(0,0,0,0.05), dark:bg-neutral-800\"> .env </code> &nbsp;file."
    ],
    [
        "Personalization", "UI to change the theme and accent color of the application from the personalization page."
    ],
    [
        "Personalization", "Added option to change the accent color of the application."
    ],
    [
        "Personalization", "Personalization linked with the user account in database, so that the settings are synced across devices."
    ],
    [
        "Sidebar", "Sidebar icons are colored based on the theme."
    ],
    [
        "Code Snippets", "Data synced to database, no more dummy data."
    ],
    [
        "Code Snippets", "Create, update, and delete labels and languages from the UI."
    ],
    [
        "Code Snippets", "View snippets by clicking on the list entry."
    ],
    [
        "Bug fix", "Module sidebar&apos;s behaviour is now separated from the main sidebar."
    ],
];

(async () => {
    const pb = new Pocketbase("http://127.0.0.1:8090");

    for (const [feature, description] of data) {
        await pb.collection("change_log_entry").create({
            feature,
            description,
        }, {
            '$autoCancel': false,
        });
    }
})()