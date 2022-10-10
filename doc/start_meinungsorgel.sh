#!/bin/bash

ln -s /etc/nginx/sites-available/smalldata /etc/nginx/sites-enabled/smalldata
service nginx reload
