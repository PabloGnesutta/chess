cd ./frontend
echo " - Installing frontend dependencies"
npm i
echo " - Transpiling frontend"
npm run build
cd ../backend
echo "- Installing backend dependencies"
npm i
echo " - Transpiling backend"
npm run build
echo " - Building frontend environment"
node build-env-frontend.js
