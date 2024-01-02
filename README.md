# holiday club

Backend API for a Children's Summer Holiday Club application which is a summer club management website/application

--- Folder Structure ---
.DS_Store
README.md
[docs]
    └── .project_structure_ignore
[holiday-club-server]
    ├── .DS_Store
    ├── README.md
    ├── [data]
        ├── tasks.json
        └── users.json
    ├── dbseeder.js
    ├── index.js
    ├── package-lock.json
    ├── package.json
    ├── [public]
    ├── [src]
        ├── [cloudinary]
            └── index.js
        ├── [config]
            └── db.js
        ├── [controllers]
            ├── auth.js
            ├── members.js
            ├── photos.js
            └── users.js
        ├── [middleware]
            ├── advancedresults.js
            ├── async.js
            ├── auth.js
            ├── checkActivityAccess.js
            └── error.js
        ├── [models]
            ├── Member.js
            └── User.js
        ├── [routes]
            ├── auth.js
            ├── members.js
            ├── photos.js
            └── users.js
        └── [utils]
            ├── errorResponse.js
            ├── geocoder.js
            └── sendEmail.js
    └── [target]
        └── npmlist.json
