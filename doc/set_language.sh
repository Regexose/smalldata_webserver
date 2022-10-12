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

cd /home/smalldata/smalldata_webserver || exit

# replace language in settings.ini
sed_str="s/APP_LANGUAGE=[a-z][a-z]/APP_LANGUAGE=$lang/g"
su - smalldata -c sed -i -E "$sed_str" settings.ini

# write new .env-file
su - smalldata -c /home/smalldata/venv/bin/python create_env_file.py

# build frontend files
cd frontend || exit
su - smalldata -c npm run relocate
cd ..

# collect all static files
su - smalldata -c /home/smalldata/venv/bin/python python manage.py collectstatic --noinput

systemctl restart gunicorn
service nginx restart