## Installation

### Backend
0. run `git clone git@github.com:Regexose/SmallData.git`
1. install python >= 3.8.0 (I recommend pyenv or virtualenv)
2. run `pip install -r requirements.txt`
3. run `python -m spacy download de_core_news_sm`
4. download the `german_model` and place it into the folder `model_data`
5. download trained models from https://1drv.ms/u/s!AmoEVYq8BVEZm75RMZ18TllnQRcxWw?e=Y30JCfand and put them in a 
folder `trained_models` in the `model_data` - folder
6. install `postgres`, create a db and a user 
7. in the projects' root directory, create a copy of `settings.ini.template`, call it `settings.ini`. and edit with the correct values

8. run `python manage.py makemigrations && python manage.py migrate`
9. Load initial data into db by `python manage.py loaddata fixtures/initial_fixture.yaml `
10. start the api: `python manage.py runserver`


### Frontend
1. cd into `frontend`, run `npm install`
2. inside `frontend`, create a file `.env` with content (or add urls of running server)
   ```
   REACT_APP_WS_URL = ws://localhost:8000/ws/
   REACT_APP_HTTP_URL = http://localhost:8000/api/
   ```
3. run `npm run start`
4. open browser & navigate to `localhost:3000`