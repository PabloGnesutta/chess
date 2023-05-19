cd ./frontend
echo " - Install frontend dependencies"
npm i
echo " - Transpile frontend"
npm run build
cd ../backend
echo "- Install backend dependencies"
npm i
echo " - Transpile backend"
npm run build
echo " - Build frontend environment"
node build-env-frontend.js
