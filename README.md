## Installation

### Backend

For development, we introduced a [Dockerfile](/Dockerfile) and a [docker-compose.yml](/docker-compose.yml) file which one can use through helper make rules defined in the [Makefile](/Makefile). This simplifies the usage of the configuration to `make build` and `bash` commands effectively. The configuration can furthermore be parameterized through the [.env](/.env) file and [project.mk](/project.mk) file.

> ⚠️ The configuration is a WIP dev setup that still needs simplification (e.g.: [requirements-dev.txt](/requirements-dev.txt) needs to be merged into requirements.txt and all the added files which were basically copied over from template projects need to be simplified/reduced). Considering the scarcity of time on our end, we have submitted our changes as-is but the Future Work section provides suggestions for tasks to be resolved.

Usage steps:
1. **run `make env`** to populate a starting .env file
2. **run `make image`** to invoke the `docker build` command which walks through all the motions needed to install the dependencies needed for this project into a nicely isolated container
  - ⚠️ remember to re-run this command when requirements-dev.txt or `SYSTEM_PACKAGES` inside the Makefile are changed in order to rebuild your environment
3. **run `make bash`** to enter a development shell in a docker-compose configuration
  1. download the `german_model` and place it into the folder `model_data`
  2. download trained models from https://1drv.ms/u/s!AmoEVYq8BVEZm75RMZ18TllnQRcxWw?e=Y30JCfand and put them in a folder `trained_models` in the `model_data` - folder
  3. in the projects' root directory, create a copy of `settings.ini.template`, call it `settings.ini`. and edit with the correct values
  4. run `python manage.py makemigrations && python manage.py migrate`
  5. Load initial data into db by `python manage.py loaddata fixtures/initial_fixture.yaml `
  5. start the api: `python manage.py runserver 0.0.0.0:8000`
  6. open a browser & navigate to `localhost:8000/api/categories`. Create database entries:
     1. `praise`
     2. `dissence`
     3. `lecture`
     4. `insinuation`
     5. `concession`
     6. `unknown`

> 💡 The reason we have a convoluted setup of volume mounts in place (see the `DOCKER_ARGS` variable definition in the Makefile or `services.app.volumes` inside of docker-compose.yml) is because we sometimes want faster development cycles while debugging our configuration. This allows us to avoid "restarting our build process from zero" (i.e.: a clean image build) every time we make minor changes or whenever we start new sessions (e.g.: between workstation restarts). Furthermore, it helps us to have "easy access" to relevant files when we run into issues since accessing files inside a container is a bit less trivial than simply navigating the project directory tree. Typically, we reduce the setup for production builds once the configuration has been sufficiently tested but as this was just a quick support project and the configuration is still in a WIP state, we're unfortunately dumping this complexity onto you with 1) the hope that you can navigate it and 2) the knowledge that you can find us when help is needed.

> 💡 Instead of directly editing the Makefile, you can populate a project.mk file (which the Makefile will load after defining its variables) to define custom rules or define (or override) variables. This is probably the easiest way to test customizations to the Makefile setup before actually altering the Makefile.

#### Future Work

1. Remove the Poetry references in Makefile (these are remnants of our template since we use Poetry as a default package manager for Python projects)
1. Merge requirements-dev.txt into requirements.txt
1. Parameterize `POSTGRES_PASSWORD` and `DATABASE_URL` in docker-compose.yml perhaps through .env (since the hardcoded setup was just a quick-fix to expedite configuration testing)

### Frontend
1. cd into `frontend`, run `npm install`
2. inside `frontend`, create a file `.env` with content (or add urls of running server)
   ```
   REACT_APP_WS_URL = ws://localhost:8000/ws/
   REACT_APP_HTTP_URL = http://localhost:8000/api/
   ```
3. run `npm run start`
4. open browser & navigate to `localhost:3000`