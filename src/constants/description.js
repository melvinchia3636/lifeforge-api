const DESCRIPTION = {
    'GET /': 'Root endpoint of the API',
    'GET /media/{collectionId}/{entryId}/{photoId}':
        'Retrieve a specific media photo by collection, entry, and photo IDs',
    'GET /locales/{language}':
        'Retrieve localization data for a specified language',
    'POST /locales/add-entry': 'Add a new entry to the localization data',
    'POST /locales/ai-generate': 'AI-generated localization entries',
    'PATCH /locales/rename-key': 'Rename a key in the localization data',
    'PUT /locales/update/{language}':
        'Update localization data for a specified language',
    'POST /user/auth/login': 'User login authentication',
    'POST /user/auth/verify': 'Verify user authentication',
    'PATCH /user/module': 'Update user module settings',
    'PUT /user/module/config': 'Configure user module settings',
    'GET /user/passkey/challenge': 'Retrieve a passkey challenge for the user',
    'POST /user/passkey/register': 'Register a new user passkey',
    'POST /user/passkey/login': 'User login using passkey',
    'PATCH /user/personalization': 'Update user personalization settings',
    'PATCH /user/settings': 'Update user settings',
    'PUT /user/settings/avatar': 'Update user avatar',
    'DELETE /user/settings/avatar': 'Delete user avatar',
    'GET /projects-k/entry/get/{id}': 'Get a specific project entry by ID',
    'GET /projects-k/entry/valid/{id}':
        'Validate a specific project entry by ID',
    'GET /projects-k/entry/list': 'List all project entries',
    'POST /projects-k/entry/create': 'Create a new project entry',
    'PATCH /projects-k/entry/update-status/{id}':
        'Update the status of a project entry by ID',
    'GET /projects-k/files/download/{projectId}':
        'Download files of a specific project',
    'PUT /projects-k/files/replace/{projectId}':
        'Replace files in a specific project',
    'PUT /projects-k/files/set-thumbnail/{projectId}':
        'Set the thumbnail for a specific project',
    'DELETE /projects-k/files/clear-medium':
        'Clear the medium files of a project',
    'GET /projects-k/ip': 'Get IP information for projects',
    'GET /projects-k/progress/list-steps': 'List all steps in project progress',
    'GET /projects-k/progress/get/{id}':
        'Get progress details for a specific project step',
    'PATCH /projects-k/progress/complete-step/{id}':
        'Mark a project step as complete',
    'PATCH /projects-k/progress/uncomplete-step/{id}':
        'Mark a project step as incomplete',
    'GET /todo-list/entry': 'Get a todo list entry',
    'GET /todo-list/entry/status-counter':
        'Get status counter of todo list entries',
    'POST /todo-list/entry': 'Create a new todo list entry',
    'POST /todo-list/entry/toggle/{id}':
        'Toggle the status of a todo list entry by ID',
    'PATCH /todo-list/entry/{id}': 'Update a todo list entry by ID',
    'DELETE /todo-list/entry/{id}': 'Delete a todo list entry by ID',
    'GET /todo-list/list': 'Get a list of todo lists',
    'POST /todo-list/list': 'Create a new todo list',
    'PATCH /todo-list/list/{id}': 'Update a todo list by ID',
    'DELETE /todo-list/list/{id}': 'Delete a todo list by ID',
    'GET /todo-list/subtask/list/{id}':
        'Get a list of subtasks for a specific todo list',
    'POST /todo-list/subtask/ai-generate':
        'AI-generated subtasks for a todo list',
    'PATCH /todo-list/subtask/toggle/{id}':
        'Toggle the status of a subtask by ID',
    'GET /todo-list/tag': 'Get a list of tags for todo lists',
    'POST /todo-list/tag': 'Create a new tag for todo lists',
    'PATCH /todo-list/tag/{id}': 'Update a tag for todo lists by ID',
    'DELETE /todo-list/tag/{id}': 'Delete a tag for todo lists by ID',
    'GET /calendar/category': 'Get a list of calendar categories',
    'POST /calendar/category': 'Create a new calendar category',
    'PATCH /calendar/category/{id}': 'Update a calendar category by ID',
    'DELETE /calendar/category/{id}': 'Delete a calendar category by ID',
    'GET /calendar/event': 'Get a list of calendar events',
    'POST /calendar/event': 'Create a new calendar event',
    'PATCH /calendar/event/{id}': 'Update a calendar event by ID',
    'DELETE /calendar/event/{id}': 'Delete a calendar event by ID',
    'GET /idea-box/container/{id}': 'Get a specific idea box container by ID',
    'GET /idea-box/container/valid/{id}':
        'Validate a specific idea box container by ID',
    'GET /idea-box/container': 'Get a list of idea box containers',
    'POST /idea-box/container': 'Create a new idea box container',
    'PATCH /idea-box/container/{id}': 'Update an idea box container by ID',
    'DELETE /idea-box/container/{id}': 'Delete an idea box container by ID',
    'GET /idea-box/folder/get/{id}': 'Get a specific idea box folder by ID',
    'GET /idea-box/folder/list/{id}':
        'Get a list of folders in an idea box container',
    'POST /idea-box/folder': 'Create a new folder in an idea box container',
    'POST /idea-box/folder/idea/{folderId}':
        'Add an idea to a folder in an idea box container',
    'PATCH /idea-box/folder/{id}': 'Update an idea box folder by ID',
    'DELETE /idea-box/folder/{id}': 'Delete an idea box folder by ID',
    'DELETE /idea-box/folder/idea/{folderId}':
        'Delete an idea from a folder in an idea box container',
    'GET /idea-box/idea/{containerId}':
        'Get a list of ideas in an idea box container',
    'GET /idea-box/idea/{containerId}/{folderId}':
        'Get a list of ideas in a specific folder of an idea box container',
    'POST /idea-box/idea/{containerId}':
        'Create a new idea in an idea box container',
    'POST /idea-box/idea/pin/{id}': 'Pin an idea in an idea box container',
    'POST /idea-box/idea/archive/{id}':
        'Archive an idea in an idea box container',
    'PATCH /idea-box/idea/{id}':
        'Update an idea in an idea box container by ID',
    'DELETE /idea-box/idea/{id}':
        'Delete an idea in an idea box container by ID',
    'GET /code-time/activities': 'Get a list of coding activities',
    'GET /code-time/each-day': 'Get coding activities for each day',
    'POST /code-time/eventLog': 'Log a coding event',
    'GET /code-time/languages': 'Get a list of coding languages used',
    'GET /code-time/projects': 'Get a list of coding projects',
    'GET /code-time/statistics': 'Get coding statistics',
    'GET /code-time/user/minutes':
        'Get the number of coding minutes logged by the user',
    'GET /notes/entry/get/{id}': 'Get a specific note entry by ID',
    'GET /notes/entry/list/{subject}/*':
        'Get a list of note entries for a specific subject',
    'GET /notes/entry/valid/{workspace}/{subject}/*':
        'Validate a note entry for a specific workspace and subject',
    'GET /notes/entry/path/{workspace}/{subject}/*':
        'Get the path of a note entry for a specific workspace and subject',
    'POST /notes/entry/create/folder': 'Create a new folder for note entries',
    'POST /notes/entry/upload/{workspace}/{subject}/*':
        'Upload a note entry for a specific workspace and subject',
    'PATCH /notes/entry/update/folder/{id}': 'Update a note entry folder by ID',
    'DELETE /notes/entry/delete/{id}': 'Delete a note entry by ID',
    'GET /notes/subject/{id}': 'Get a specific note subject by ID',
    'POST /notes/subject': 'Create a new note subject',
    'PATCH /notes/subject/{id}': 'Update a note subject by ID',
    'DELETE /notes/subject/{id}': 'Delete a note subject by ID',
    'GET /notes/workspace/get/{id}': 'Get a specific note workspace by ID',
    'GET /notes/workspace/valid/{id}':
        'Validate a specific note workspace by ID',
    'GET /notes/workspace/list': 'Get a list of note workspaces',
    'GET /flashcards/card/list/{id}': 'List cards in a deck by ID',
    'PUT /flashcards/card/update': 'Update a flashcard',
    'GET /flashcards/deck/get/{id}': 'Get deck details by ID',
    'GET /flashcards/deck/valid/{id}': 'Check if a deck is valid by ID',
    'GET /flashcards/deck/list': 'List all decks',
    'GET /flashcards/tag/list': 'List all tags',
    'GET /journal/entry/get/{id}': 'Get journal entry by ID',
    'GET /journal/entry/valid/{id}': 'Check if a journal entry is valid by ID',
    'GET /journal/entry/list': 'List all journal entries',
    'POST /journal/entry/create': 'Create a new journal entry',
    'PATCH /journal/entry/update-title/{id}':
        'Update the title of a journal entry by ID',
    'PUT /journal/entry/update-content/{id}':
        'Update the content of a journal entry by ID',
    'DELETE /journal/entry/delete/{id}': 'Delete a journal entry by ID',
    'GET /achievements/entry/{difficulty}': 'Get achievements by difficulty',
    'POST /achievements/entry': 'Create a new achievement',
    'PATCH /achievements/entry/{id}': 'Update an achievement by ID',
    'DELETE /achievements/entry/{id}': 'Delete an achievement by ID',
    'GET /wallet/assets': 'List all assets',
    'POST /wallet/assets': 'Create a new asset',
    'PATCH /wallet/assets/{id}': 'Update an asset by ID',
    'DELETE /wallet/assets/{id}': 'Delete an asset by ID',
    'GET /wallet/category': 'List all categories',
    'POST /wallet/category': 'Create a new category',
    'PATCH /wallet/category/{id}': 'Update a category by ID',
    'DELETE /wallet/category/{id}': 'Delete a category by ID',
    'GET /wallet/ledgers': 'List all ledgers',
    'POST /wallet/ledgers': 'Create a new ledger',
    'PATCH /wallet/ledgers/{id}': 'Update a ledger by ID',
    'DELETE /wallet/ledgers/{id}': 'Delete a ledger by ID',
    'GET /wallet/transactions': 'List all transactions',
    'GET /wallet/transactions/income-expenses/{year}/{month}':
        'Get income and expenses for a specific month and year',
    'POST /wallet/transactions': 'Create a new transaction',
    'PATCH /wallet/transactions/{id}': 'Update a transaction by ID',
    'DELETE /wallet/transactions/{id}': 'Delete a transaction by ID',
    'GET /spotify/auth/login': 'Login to Spotify',
    'GET /spotify/auth/callback': 'Spotify authentication callback',
    'GET /spotify/auth/refresh': 'Refresh Spotify authentication token',
    'GET /photos/album/get/{id}': 'Get album details by ID',
    'GET /photos/album/valid/{id}': 'Check if an album is valid by ID',
    'GET /photos/album/list': 'List all albums',
    'GET /photos/album/check-publicity/{id}':
        'Check the publicity status of an album by ID',
    'GET /photos/album/tag/list': 'List all album tags',
    'POST /photos/album/create': 'Create a new album',
    'POST /photos/album/set-cover/{albumId}/{imageId}':
        'Set album cover by album ID and image ID',
    'POST /photos/album/set-publicity/{albumId}':
        'Set album publicity by album ID',
    'PATCH /photos/album/add-photos/{albumId}':
        'Add photos to an album by album ID',
    'PATCH /photos/album/rename/{albumId}': 'Rename an album by album ID',
    'PATCH /photos/album/tag/update-album/{albumId}':
        'Update album tags by album ID',
    'DELETE /photos/album/remove-photo/{albumId}':
        'Remove a photo from an album by album ID',
    'DELETE /photos/album/delete/{albumId}': 'Delete an album by album ID',
    'GET /photos/entry/name/{id}': 'Get photo entry name by ID',
    'GET /photos/entry/download/{id}': 'Download photo entry by ID',
    'GET /photos/entry/dimensions/async-get':
        'Get photo dimensions asynchronously',
    'GET /photos/entry/dimensions/async-res':
        'Get result of async dimensions request',
    'GET /photos/entry/list': 'List all photo entries',
    'GET /photos/entry/list/{albumId}': 'List photo entries by album ID',
    'GET /photos/entry/import/progress': 'Get import progress of photo entries',
    'POST /photos/entry/bulk-download': 'Bulk download photo entries',
    'POST /photos/entry/import': 'Import photo entries',
    'DELETE /photos/entry/delete': 'Delete a photo entry',
    'GET /photos/favourites/list': 'List all favourite photos',
    'PATCH /photos/favourites/add-photos': 'Add photos to favourites',
    'GET /photos/trash/list': 'List all photos in trash',
    'DELETE /photos/trash/empty': 'Empty the trash',
    'GET /music/entry': 'List all music entries',
    'GET /music/entry/import-status': 'Get music import status',
    'POST /music/entry/import': 'Import music entries',
    'POST /music/entry/favourite/{id}': 'Mark music entry as favourite by ID',
    'PATCH /music/entry/{id}': 'Update music entry by ID',
    'DELETE /music/entry/{id}': 'Delete music entry by ID',
    'GET /music/youtube/get-info/{id}': 'Get YouTube video info by ID',
    'GET /music/youtube/download-status': 'Get YouTube download status',
    'POST /music/youtube/async-download/{id}':
        'Asynchronously download YouTube video by ID',
    'GET /guitar-tabs/list': 'List all guitar tabs',
    'GET /guitar-tabs/process-status': 'Get guitar tabs processing status',
    'POST /guitar-tabs/upload': 'Upload guitar tabs',
    'GET /repositories/repo/list': 'List all repositories',
    'GET /passwords/master/challenge': 'Get master password challenge',
    'POST /passwords/master': 'Set master password',
    'POST /passwords/master/verify': 'Verify master password',
    'GET /passwords/password/challenge': 'Get password challenge',
    'GET /passwords/password/decrypt/{id}': 'Decrypt password by ID',
    'GET /passwords/password': 'List all passwords',
    'POST /passwords/password': 'Create a new password',
    'POST /passwords/password/pin/{id}': 'Pin a password by ID',
    'PATCH /passwords/password/{id}': 'Update password by ID',
    'DELETE /passwords/password/{id}': 'Delete password by ID',
    'GET /mail-inbox/list': 'List all mail inbox entries',
    'GET /dns-records/list': 'List all DNS records',
    'GET /server/cpu': 'Get CPU usage',
    'GET /server/cpu-temp': 'Get CPU temperature',
    'GET /server/disks': 'Get disk usage',
    'GET /server/info': 'Get server info',
    'GET /server/memory': 'Get memory usage',
    'GET /change-log/list': 'List all change logs',
    'GET /books-library/cover/{author}/{book}':
        'Get book cover by author and book name',
    'GET /books-library/list': 'List all books in the library',
    'GET /cron': 'Cron job to prevent server from sleeping'
}

export default DESCRIPTION
