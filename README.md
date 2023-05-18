Development:
    /frontend:
        npm i
        set appropiate values in env.ts
            theese need to be in sync with what build-env-frontend outputs
                which is in itself synced with .env
        npm run dev
            This watchs js file changes and transpile them on the fly
        then you can either open index.html with Liver Server or open the server's root address in a browser

    /backend
        npm i
        npm run serve

Production/Staging/Etc:
    /frontend:
        npm i

    /backend
        npm i
        make sure environment variables are properly set

    / (root):
        ./build.sh
            This will build the backend, the frontend and its environment

    Then PM2 or whatever

