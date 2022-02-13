export DATABASE_URL=$(node ./src/commons/secret-startup.js)
export BUSINESS_DATABASE_URL=$(node ./src/commons/business-secret-startup.js)
npm run migrate_up_all
npm start
