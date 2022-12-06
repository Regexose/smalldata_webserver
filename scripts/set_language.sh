#!/bin/bash

languages="de en auto";

# handle input
lang="$1";
echo "$languages" | grep -w -q "$lang";
if [ $? = 1 ]; then
  echo "Provided language not implemented! PLease use one of the following:"
  echo "$languages"
  exit
fi

# Make sure script is run as smalldata
if [ `whoami` != 'smalldata' ]; then
  echo "This command must be run as user 'smalldata'! Exiting";
  exit
fi

# replace language in .env-file
sed -i -E s/REACT_APP_LANGUAGE\ =\ .*/REACT_APP_LANGUAGE\ =\ "$lang"/g ~/smalldata_webserver/frontend/.env
rm ~/smalldata_webserver/frontend/.env-E || exit

# build frontend files
cd ~/smalldata_webserver/frontend || exit
npm run relocate
cd ..

# collect all static files
~/venv/bin/python manage.py collectstatic --noinput