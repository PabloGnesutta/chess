A multiplayer online chess application.
Backend made in node.js with no dependencies, including Websocket management and messaging.
Frontend made in vanilla JavaScript.

See it live at https://chess.pablognesutta.com 
The UI is not great. I concentrated my efforts on functionality, game logic, and WebSocket implementation.
In order to play, join in two separate tabs/browser windows.

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
    /backend
        cp .env.example .env
        set env variables

    / (root):
        ./build.sh
            This will build the backend, the frontend and its environment

    /backend/build
        Then PM2 (or whatever) index.chess.js


TypeScript files on the frontend will be transpiled to /public/js-build, and from there be served on the backend

