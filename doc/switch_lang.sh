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

# replace language in settings.ini
sed_str="s/APP_LANGUAGE=[a-z][a-z]/APP_LANGUAGE=$lang/g"
su -c smalldata sed -i -E "$sed_str" ../settings.ini

# remove existing .env-file
rm ../frontend/.env

su smalldata -c "/home/smalldata/venv/bin/python /home/smalldata/smalldata_webserver/build_frontend.py"

systemctl restart gunicorn
