cd ./frontend
echo "Transpiling frontend"
npm run build
cd ../backend
echo "Transpiling backend"
npm run build
echo "Building frontend environment"
node build-env-frontend.js
npm run serve
