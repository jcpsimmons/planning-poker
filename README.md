# Planning Poker

This is the source code for a very simple planning poker for Metadrop.

# Installation

``` bash
git clone git@bitbucket.org:metadrop/planning-poker.git
cd planning-poker
npm install
```

# Running the project
This will run project with ngrok.

## 1) Up docker compose
`docker-compose up -d --build`

## 2) Get ngrok url
`curl $(docker port ngrok 4040)/api/tunnels | grep -Po "https"://[^\"]+`

This will output a ngrok url like this:

`https://exampledomain.eu.ngrok.io/`
