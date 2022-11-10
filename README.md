# Meinungsorgel
This is the repository for the webserver of the 'Meinungsorgel'.
If you want to run the entire Meinungsorgel, you will need access to the following repositories:

1. [smalldata_webserver](https://github.com/Regexose/smalldata_webserver): this one
2. [smalldata_classification](https://github.com/staudamm/smalldata_classification): model training
3. [smalldata_proxy](https://github.com/staudamm/smalldata_proxy): a simple http-to-osc translater
4. [SmallData](https://github.com/Regexose/SmallData): scripts for audio (SuperCollider) and visual (Processing) representation


## Installation (development)

### Backend
1. run `git clone git@github.com:Regexose/SmallData.git`
2. install python >= 3.8.0 (I recommend pyenv or virtualenv)
3. run `pip install -r requirements.txt`
4. download trained models (ideally from meinungsorgel.de) and put them in a 
folder `trained_models` in the `model_data` - folder
5. install `postgres`, create a db and a user (see __Setup postgres__-section in `/doc/deployment.md`). When using OSX, 
I suggest to use the PostGRes.app instead of homebrew installation
6. In the projects' root directory, create a copy of `settings.ini.template`, call it `settings.ini`. and edit with the 
correct values
7. run `python manage.py makemigrations && python manage.py migrate`
8. Load initial data into db by `python manage.py loaddata fixtures/initial_fixture.yaml `
9. install and start redis (`brew install redis && brew services start redis`)
10. start the api: `python manage.py runserver`


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

## Installation (production)
See `doc/deployment.md`

## Management
### Preperation (locally)
1. create a virtual url with ngrok. In Terminal (no cd required)
```
ngrok http 8080
```
2. activate python proxy - translates http messages to osc messages. cd /Meinungsorgel_Git/smalldata_proxy 
```
python proxy.py
```
3. In a new Terminal Tab, use ssh to login into meinungsorgel.de (ssh password required)
```
ssh root@meinungsorgel.de
```
4. Write the virtual url from the ngrok window into "settings.ini"
```
su smalldata
nano /home/smalldata/smalldata_webserver/settings.ini
```
Navigate to the line SUPERCOLLIDER_URL and paste the virtual url behind the "=". 
Save the file with Ctrl-O and exit with Ctrl -X.
Exit su session with "exit"


### Forwarding of messages to SuperCollider
cd to smalldata_proxy
```
python proxy.py
```

### Start / stop webservice in production
Start backend & frontend
```
`~/start_meinungsorgel.sh`
```
To stop, use `~/stop_meinungsorgel.sh`

### Change language
#### Development
The operating language of the backend-application (i.e. the classification) is set by the parameter `APP_LANGUAGE` in
`settings.ini` (either `de` or `en`). To change the language of the frontend, set `REACT_APP_LANGUAGE` in
the `.env` - file in the `frontend` - folder

#### Production (meinungsorgel.de)
In production, the langauge is changed by running the `set_langauge.sh` - script in
`/home/smalldata/smalldata_webserver/scripts/` as `smalldata`:

```
ssh root@meinungsorgel.de
su smalldata
cd /home/smalldata/smalldata_webserver/scripts/
./set_language.sh de (bzw en)
exit (ctrl+d)
~/start_meinungsorgel.sh
```
 
Warnings: 
 1. You need to add a language code as an argument to the script, i.e. type `set_langauge.sh en` (or de)
 2. The script must be run as user `smalldata`, i.e. type `su smalldata` before
 3. You have to restart `gunicorn` and `nginx` afterwards, or simply run `/home/root/start_meinungsorgel.sh` (as `root`)





