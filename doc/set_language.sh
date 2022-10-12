#!/bin/bash

# handle input
if [ "$1" = 'en' ]; then
  lang='en';
elif [ "$1" = "de" ]; then
  lang='de';
else
  echo "argument must be 'en' or 'de'!";
  exit
fi


if [ `whoami` != 'smalldata' ]; then
  echo "This command must be run as user 'smalldata'! Exiting";
  exit
fi


cd ~/smalldata_webserver || exit


# replace language in settings.ini
sed -i -E s/APP_LANGUAGE=[a-z][a-z]/APP_LANGUAGE=$lang/g ~/smalldata_webserver/settings.ini

# write new .env-file
~/venv/bin/python ~/smalldata_webserver/create_env_file.py


# build frontend files
cd frontend
npm run relocate
cd ..

# collect all static files
~/venv/bin/python manage.py collectstatic --noinput