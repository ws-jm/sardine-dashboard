cd server
rm -rf node_modules
npm ci
npm link ../shared

cd ../frontend
rm -rf node_modules
npm ci
npm link ../shared
