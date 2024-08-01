const DESCRIPTION = {
    'GET /': 'Root endpoint of the API',
    'GET /media/{collectionId}/{entriesId}/{photoId}':
        'Retrieve a specific media photo by collection, entries, and photo IDs',
    'GET /locales/{language}':
        'Retrieve localization data for a specified language',
    'POST /locales/add-entries': 'Add a new entries to the localization data',
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
    'GET /projects-k/entries/get/{id}': 'Get a specific project entries by ID',
    'GET /projects-k/entries/valid/{id}':
        'Validate a specific project entries by ID',
    'GET /projects-k/entries/list': 'List all project entries',
    'POST /projects-k/entries/create': 'Create a new project entries',
    'PATCH /projects-k/entries/update-status/{id}':
        'Update the status of a project entries by ID',
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
    'GET /todo-list/entries': 'Get a todo list entries',
    'GET /todo-list/entries/status-counter':
        'Get status counter of todo list entries',
    'POST /todo-list/entries': 'Create a new todo list entries',
    'POST /todo-list/entries/toggle/{id}':
        'Toggle the status of a todo list entries by ID',
    'PATCH /todo-list/entries/{id}': 'Update a todo list entries by ID',
    'DELETE /todo-list/entries/{id}': 'Delete a todo list entries by ID',
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
    'GET /notes/entries/get/{id}': 'Get a specific note entries by ID',
    'GET /notes/entries/list/{subject}/*':
        'Get a list of note entries for a specific subject',
    'GET /notes/entries/valid/{workspace}/{subject}/*':
        'Validate a note entries for a specific workspace and subject',
    'GET /notes/entries/path/{workspace}/{subject}/*':
        'Get the path of a note entries for a specific workspace and subject',
    'POST /notes/entries/create/folder': 'Create a new folder for note entries',
    'POST /notes/entries/upload/{workspace}/{subject}/*':
        'Upload a note entries for a specific workspace and subject',
    'PATCH /notes/entries/update/folder/{id}': 'Update a note entries folder by ID',
    'DELETE /notes/entries/delete/{id}': 'Delete a note entries by ID',
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
    'GET /journal/entries/get/{id}': 'Get journal entries by ID',
    'GET /journal/entries/valid/{id}': 'Check if a journal entries is valid by ID',
    'GET /journal/entries/list': 'List all journal entries',
    'POST /journal/entries/create': 'Create a new journal entries',
    'PATCH /journal/entries/update-title/{id}':
        'Update the title of a journal entries by ID',
    'PUT /journal/entries/update-content/{id}':
        'Update the content of a journal entries by ID',
    'DELETE /journal/entries/delete/{id}': 'Delete a journal entries by ID',
    'GET /achievements/entries/{difficulty}': 'Get achievements by difficulty',
    'POST /achievements/entries': 'Create a new achievement',
    'PATCH /achievements/entries/{id}': 'Update an achievement by ID',
    'DELETE /achievements/entries/{id}': 'Delete an achievement by ID',
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
    'GET /photos/entries/name/{id}': 'Get photo entries name by ID',
    'GET /photos/entries/download/{id}': 'Download photo entries by ID',
    'GET /photos/entries/dimensions/async-get':
        'Get photo dimensions asynchronously',
    'GET /photos/entries/dimensions/async-res':
        'Get result of async dimensions request',
    'GET /photos/entries/list': 'List all photo entries',
    'GET /photos/entries/list/{albumId}': 'List photo entries by album ID',
    'GET /photos/entries/import/progress': 'Get import progress of photo entries',
    'POST /photos/entries/bulk-download': 'Bulk download photo entries',
    'POST /photos/entries/import': 'Import photo entries',
    'DELETE /photos/entries/delete': 'Delete a photo entries',
    'GET /photos/favourites/list': 'List all favourite photos',
    'PATCH /photos/favourites/add-photos': 'Add photos to favourites',
    'GET /photos/trash/list': 'List all photos in trash',
    'DELETE /photos/trash/empty': 'Empty the trash',
    'GET /music/entries': 'List all music entries',
    'GET /music/entries/import-status': 'Get music import status',
    'POST /music/entries/import': 'Import music entries',
    'POST /music/entries/favourite/{id}': 'Mark music entries as favourite by ID',
    'PATCH /music/entries/{id}': 'Update music entries by ID',
    'DELETE /music/entries/{id}': 'Delete music entries by ID',
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
    'GET /cron': 'Cron job to prevent server from sleeping',
    'GET /projects-m/category': 'Get a list of project categories',
    'POST /projects-m/category': 'Create a new project category',
    'PATCH /projects-m/category/{id}': 'Update a project category by ID',
    'DELETE /projects-m/category/{id}': 'Delete a project category by ID',
    'GET /projects-m/status': 'Get project status',
    'POST /projects-m/status': 'Create a new project status',
    'PATCH /projects-m/status/{id}': 'Update project status by ID',
    'DELETE /projects-m/status/{id}': 'Delete project status by ID',
    'GET /projects-m/technology': 'Get a list of project technologies',
    'POST /projects-m/technology': 'Create a new project technology',
    'PATCH /projects-m/technology/{id}': 'Update a project technology by ID',
    'DELETE /projects-m/technology/{id}': 'Delete a project technology by ID',
    'GET /projects-m/visibility': 'Get a list of project visibility options',
    'POST /projects-m/visibility': 'Create a new project visibility option',
    'PATCH /projects-m/visibility/{id}':
        'Update a project visibility option by ID',
    'DELETE /projects-m/visibility/{id}':
        'Delete a project visibility option by ID',
    'GET /projects-m/entries': 'Get a list of project entries',
    'GET /projects-m/entries/{id}': 'Get a specific project entries by ID',
    'GET /projects-m/entries/valid/{id}':
        'Validate a specific project entries by ID',
    'POST /projects-m/entries': 'Create a new project entries',
    'PATCH /projects-m/entries/{id}': 'Update a project entries by ID',
    'DELETE /projects-m/entries/{id}': 'Delete a project entries by ID',
    'GET /projects-m/kanban/column/{projectId}':
        'Get kanban columns for a specific project',
    'POST /projects-m/kanban/column/{projectId}':
        'Create a new kanban column for a specific project',
    'PATCH /projects-m/kanban/column/{id}': 'Update a kanban column by ID',
    'DELETE /projects-m/kanban/column/{id}': 'Delete a kanban column by ID',
    'GET /airports/airport/{airportID}': 'Get airport details by ID',
    'GET /airports/airport/{airportID}/flights/{type}':
        'Get flights for a specific airport by ID and type',
    'GET /airports/airport/{airportID}/METAR':
        'Get METAR data for a specific airport by ID',
    'GET /airports/airport/{airportID}/NOTAM':
        'Get NOTAM data for a specific airport by ID',
    'GET /airports/airport/{airportID}/radios':
        'Get radio frequencies for a specific airport by ID',
    'GET /airports/airports/{id}': 'Get airport details by ID',
    'GET /airports/continents': 'Get a list of continents',
    'GET /airports/countries/{id}': 'Get country details by ID',
    'GET /airports/NOTAM/{NOTAMID}': 'Get NOTAM details by ID',
    'GET /airports/NOTAM/{NOTAMID}/summarize': 'Summarize NOTAM details by ID',
    'GET /airports/regions/{id}': 'Get region details by ID',
    'GET /airports/search': 'Search for airports'
}

export default DESCRIPTION
