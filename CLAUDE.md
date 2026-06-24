# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Webserver for the "Meinungsorgel", an interactive installation that listens to spoken audience
utterances, classifies them into rhetorical categories with a fine-tuned transformer model, and
pushes the results out over WebSockets to a browser display and to an external proxy that
forwards them as OSC messages to SuperCollider/Processing for sound and visuals.

This repo is one of four that make up the full installation (see README.md for links):
`smalldata_webserver` (this repo, Django + React), `smalldata_classification` (model training),
`smalldata_proxy` (HTTP-to-OSC translator, the WebSocket client connecting to `ws/proxy`), and
`SmallData` (SuperCollider/Processing scripts).

## Commands

### Backend (Django, root directory)
```bash
pip install -r requirements.txt
cp settings.ini.template settings.ini   # then fill in real values
python manage.py makemigrations && python manage.py migrate
python manage.py loaddata fixtures/initial_fixture.yaml   # seeds Category + Topic rows
python manage.py runserver               # dev server, serves HTTP + WebSocket (channels dev runner)
python manage.py export_utterances <filename> <from DD.MM.YY-HH:MM> <to DD.MM.YY-HH:MM>  # CSV dump to model_data/db_dumps/
```
Requires a running local Postgres (db/user from `settings.ini`) and a running local Redis on
`localhost:6379` (`brew install redis && brew services start redis`) — the channel layer used to
broadcast WebSocket events is `channels_redis`, not the in-memory layer, even in development.

There is no configured test runner or lint/format tooling in this repo (`smalldata/tests.py` is
an empty Django test-case stub). `python manage.py test` works but nothing currently runs.

### Frontend (`frontend/`, Create React App)
```bash
npm install
npm run start      # dev server on :3000, reads frontend/.env
npm run build       # production build into frontend/build
npm run relocate    # build, then move build/ up to the project root's build/ (what Django serves)
```
`frontend/.env` must define `REACT_APP_HTTP_URL`, `REACT_APP_WS_URL`, and `REACT_APP_LANGUAGE`
(`de`, `en`, or `auto`). `scripts/create_env_file.py` / `scripts/set_language.sh` generate this
file from `settings.ini` values in production.

### Production
See `doc/deployment.md` for the full nginx/gunicorn/daphne setup. In short: gunicorn serves the
WSGI app (HTTP/API/admin) and daphne serves the ASGI app (WebSockets only); nginx proxy-passes
`/ws/` to daphne and everything else to gunicorn. `scripts/start_meinungsorgel.sh` /
`stop_meinungsorgel.sh` enable/disable the nginx site and restart gunicorn. Switching the
classification language in production is done via `scripts/set_language.sh <de|en|auto>` (must
run as the `smalldata` user; rewrites `frontend/.env`, rebuilds the frontend, and runs
`collectstatic` — gunicorn/daphne must be restarted afterwards).

## Architecture

### Two unrelated "settings" modules — don't confuse them
- `backend/settings.py` is the real Django settings module (`INSTALLED_APPS`, `DATABASES`,
  `CHANNEL_LAYERS`, etc.). Which package is used as the Django project is decoupled via the
  `PROJECT_NAME` value in `settings.ini` (should be `backend`) — `manage.py`, `wsgi.py`, and
  `asgi.py` all build `f'{config("PROJECT_NAME")}.settings'` / `.urls` / `.wsgi` /
  `.asgi` dynamically from it.
- `config/settings.py` is *not* Django settings — it's a plain module of cross-cutting constants
  (`DATA_DIR`, `LANGUAGES`, OSC addresses/ports for SuperCollider/Osculator/displays). It's
  imported in `smalldata/classifier.py` via `from smalldata_webserver.config import settings`,
  with a `sys.path` hack (`sys.path.append(...); sys.path.reverse()`) specifically so this local
  `config` package wins over a same-named `config` package pulled in by another dependency.
  Don't "simplify" that import — it's there to avoid a real namespace collision.

### Request → classify → broadcast pipeline
The core flow lives in `smalldata/views.py:UtteranceView.perform_create`:
1. A `POST /api/utterances/` arrives with `text`, `language`, `msg_id`, `path_to_file`.
2. `smalldata/serializers.py:UtteranceSerializer.validate_text` rejects utterances where too few
   words are in the classifier's vocabulary (`accept_ratio`, default 0.5).
3. `smalldata/classifier.py`'s per-language `classifier[language]` (a `DeployableBert` wrapping a
   HuggingFace `pipeline('sentiment-analysis', ...)`) predicts a category label.
4. The predicted category name is looked up in the `Category` table (seeded by
   `fixtures/initial_fixture.yaml`) — there is **no enforced link** between the model's label set
   (`DeployableBert.classes`) and the DB rows; a model retrained with different categories will
   silently warn-and-skip instead of failing loudly (see the `TODO` in `views.py`).
5. The `Utterance` is saved with the current `Topic` (`Topic.is_current=True`).
6. Unless the predicted category is `UNCLASSIFIABLE` ("unknown"), the saved data is broadcast over
   the channel layer to **two different WebSocket groups**: `BrowserConsumer.group_name`
   ("browser", consumed by the React frontend for on-screen display) and
   `ProxyConsumer.group_name` ("proxy", consumed by the external `smalldata_proxy` service, which
   also needs `path_to_file` to play back the matching audio clip).

### WebSocket consumers and routing
- `smalldata/consumers.py`: `BaseConsumer` → `BrowserConsumer` (group `"browser"`) →
  `ProxyConsumer` (subclasses `BrowserConsumer`, group `"proxy"`). Both consumers also handle
  `set_topic` and `category_counter` events pushed from `views.py` (topic changes, song-state
  updates).
- `smalldata/routing.py` maps `ws/proxy` → `ProxyConsumer` and `ws/` → `BrowserConsumer`; the
  `proxy` pattern must stay listed before the catch-all `ws/` pattern since `re_path` matches by
  prefix.
- `ASGI_APPLICATION` (used by `manage.py runserver` and daphne in prod) points at
  `backend/asgi.py`. `backend/routing.py` is an older, unused duplicate of the same
  `ProtocolTypeRouter` setup — `asgi.py` is the one actually wired up.

### Topics
A `Topic` is the discussion prompt shown to the audience; exactly one has `is_current=True` at
a time. The frontend route `/set-topic` (`TopicSelector.js`) lets an operator switch it via
`TopicView.set_current`, which flips the DB flag and broadcasts a `set_topic` event to the
`browser` group; the main display route `/` (`Main.js`) listens for that to update its header.

### Classifier loading is eager and per-language
`smalldata/classifier.py` builds `classifier = {lang: get_classifier(lang) for lang in
settings.LANGUAGES}` (`config/settings.py:LANGUAGES = ["de", "en"]`) **at import time** — i.e.
the first time `smalldata.views` or `smalldata.serializers` is imported, both HuggingFace
checkpoints under `model_data/trained_models/<lang>/checkpoint/` are loaded into memory. These
checkpoints are git-ignored and must be downloaded separately (see README.md); without them,
anything importing those modules (including Django startup and `manage.py test`) will fail. A
`DeployableMock` class exists in the same file as a stub classifier but is currently unused/unwired.

### Frontend serving
The React app is built into the project-root `build/` directory (`npm run relocate`), which
Django serves as templates/static files (`backend/settings.py` `TEMPLATES.DIRS` and
`STATICFILES_DIRS` both point at `build`). `smalldata/views.render_react` renders `build/index.html`
for both `/` and `/set-topic/` — React Router (in `App.js`) then handles the client-side split
between the `Main` display and `TopicSelector` views.
