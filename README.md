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
7. install `apt install enchant myspell-de-de` 
8. in the projects' root directory, create a copy of `settings.ini.template`, call it `settings.ini`. and edit with the correct values

9. run `python manage.py makemigrations && python manage.py migrate`
10. Load initial data into db by `python manage.py loaddata fixtures/initial_fixture.yaml `
11. start the api: `python manage.py runserver`


### Frontend
1. cd into `frontend`, run `npm install`
2. inside `frontend`, create a file `.env` with content (or add urls of running server)
   ```
   REACT_APP_WS_URL = ws://localhost:8000/ws/
   REACT_APP_HTTP_URL = http://localhost:8000/api/
   ```
3. run `npm run start`
4. open browser & navigate to `localhost:3000`




# OUTDATED
## Installation
* clone git repo
* place `german.model` in `webserver/model_data`
* install language model for spacey `python -m spacy download de`
* Setup backend:
   * Change into `backend` directory and run `python manage.py makemigrations` and `python manage.py migrate`
   * Start server by running `python manage.py runserver`
   * Create categories via `localhost:8000/api/categories` in your browser
* Setup frontend:
   *  Change into `frontend` directrory and type `npm install`



## Running

The entire application consists of several apps that communicate via OSC. The infrastructure to start those apps is capsuled in the script `run.py` in the repo's root directory.
### Backend
* contains the rest-api, the database and the logic for classification (the *interpreter*).
* start by running `python run.py backend`
### Frontend
* contains the code for the web-client, where users can enter utterances
* start by running `python run.py frontend` from repo's root directory
### Song
* contains the logic to update the song status given the entered utterances
* start by running `python run.py song`
### Display
* a pygame display that shows the song progress, user input, classification results, etc...
* start by running `python run.py display`
### Interpreter
* A mock to simulate the operation of the frontend-backend, sends random utterances and categories.
* start by running `python run.py interpreter`
### Osculator
* A mock to simulate the operation of the osculator, sends beat-information to the display.
* start by running `python run.py osculator`


