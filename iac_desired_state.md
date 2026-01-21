Domain already in DO:
mcphero.app

Two apps:
1. Backend has to be on api.mcphero.app
2. Frontend has to be on mcphero.app

Same region - US
Each should have its own postgres database version 17

All the envs vars have to match(backend_url for frontend, db creds etc. Other required I'll fill)

github repo - https://github.com/stepacool/aima-mcp
builds use Dockerfile in backend and frontend respectively


example stucture - iac_appspec_example.yaml, need to reference it
Everything written in appspec of digitalocean:
https://docs.digitalocean.com/products/app-platform/reference/app-spec/

