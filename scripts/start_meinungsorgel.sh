#!/bin/bash

ln -s /etc/nginx/sites-available/smalldata /etc/nginx/sites-enabled/smalldata 2> /dev/null
service nginx reload
systemctl restart gunicorn
service nginx restart
