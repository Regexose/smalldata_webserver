# Meinungsorgel
This is the repository for the webserver of the 'Meinungsorgel'.
If you want to run the entire Meinungsorgel, you will need access to the following repositories:

1. [smalldata_webserver](https://github.com/Regexose/smalldata_webserver): this one
2. [smalldata_classification](https://github.com/staudamm/smalldata_classification): model training
3. [smalldata_proxy](https://github.com/staudamm/smalldata_proxy): a simple http-to-osc translater
4. [SmallData](https://github.com/Regexose/SmallData): scripts for audio (SuperCollider) and visual (Processing) representation


## Installation (development mode)

### Backend
0. run `git clone git@github.com:Regexose/SmallData.git`
1. install python >= 3.8.0 (I recommend pyenv or virtualenv)
2. run `pip install -r requirements.txt`
3. download trained models (ideally from meinungsorgel.de) and put them in a 
folder `trained_models` in the `model_data` - folder
4. install `postgres`, create a db and a user (see __Setup postgres__-section in `/doc/deployment.md`). When using OSX, 
I suggest to use the PostGRes.app instead of homebrew installation
5. In the projects' root directory, create a copy of `settings.ini.template`, call it `settings.ini`. and edit with the 
correct values
6. run `python manage.py makemigrations && python manage.py migrate`
7. Load initial data into db by `python manage.py loaddata fixtures/initial_fixture.yaml `
8. install and start redis (`brew install redis && brew services start redis`)
9. start the api: `python manage.py runserver`


### Frontend
1. cd into `frontend`, run `npm install`
2. inside `frontend`, create a file `.env` with content (or add urls of running server)
   ```
   REACT_APP_WS_URL = ws://localhost:8000/ws/
   REACT_APP_HTTP_URL = http://localhost:8000/api/
   APP_LANGUAGE = de
   ```
3. run `npm run start`
4. open browser & navigate to `localhost:3000`

## Management

### Start / stop webservice in production
You can start/stop the webservice of meinungsorgel.de by navigating to `/home/root/` (where you start after 
`ssh root@meinungsorgel.de`) and typing 
```
./start_meinungsorgel.sh  (stop_meinungsorgel.sh)
```

### Change language
#### Development
The operating language of the backend-application (i.e. the classification) is set by the parameter `APP_LANGUAGE` in
`settings.ini` (either `de` or `en`). To change the language of the frontend, set `APP_LANGUAGE` in
the `.env` - file in the `frontend` - folder

#### Production
In production, the langauge is changed by running the `set_langauge.sh` - script in
`/home/smalldata/smalldata_webserver/scripts/`
 
Warnings: 
 1. you need to add a language code, i.e. type `set_langauge.sh en` (or de)
 2. the script must be run as `smalldata`!





