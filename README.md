# Planning Poker

This is the source code for a very simple planning poker for Metadrop.

# Running the project

This project has a docker-compose configuration to instance a ngrok instance where planning poker will be deployed.

You just need one command to run the project:

`./scripts/start.sh`

This will output a ngrok url like this:

`https://exampledomain.eu.ngrok.io/`

# Notes
- Now the containers are prefixed by PROJECT_NAME included in .env. If you are having some conflict edit .env file.
- To have nodejs debug info, replace on package.json start command by: "node index.js > log.log 2> log_error.log".
- To compile execute gulp (compile sass, etc): "docker-compose exec npm bash", "cd /usr/app" and "./node_modules/gulp/bin/gulp.js".
