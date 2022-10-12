# Installation bei Strato

 - `sudo apt update`
 - `sudo apt install python3-pip python3-dev git-all gunicorn libpq-dev postgresql postgresql-contrib nginx curl git-all daphne redis-server`

## Setup postgres
 - `sudo -u postgres psql` (on OSX, use `psql postgres`)
 - `CREATE DATABASE smalldata;`
 - `CREATE USER smalldata WITH PASSWORD 'password'`;
 - `ALTER ROLE smalldata SET client_encoding TO 'utf8'`;
 - `ALTER ROLE smalldata SET default_transaction_isolation TO 'read committed'`;
 - `ALTER ROLE smalldata SET timezone TO CET`;
 - `GRANT ALL PRIVILEGES ON DATABASE smalldata TO smalldata`;
 - `\q`

## Setup python
 - `sudo -H pip3 install --upgrade pip`
 - `sudo -H pip3 install virtualenv`
 - `adduser smalldata`
 - `su smalldata`
 - `cd /home/smalldata/`
 - `virtualenv venv`
 - `source venv/bin/activate`
 - `mkdir smalldata_webserver`

## Install Application 
 - Pull code into smalldata_webserver
 - run installation instructions from README.md
 - create directory `staticfiles` in applications base-dir
 - As user `smalldata` run `scripts/set_language.sh de` to 
   - write `frontend/.env` that contains the urls for the REACT-APP 
   - build the frontend code
   - collect the static files

### Open Firewall and test application
 - `su root`
 - `ufw allow 8000`
 - `ufw allow ssh`
 - Make sure ufw is running, (`ufw status`), if it is not run `ufw enable`
 - `su smalldata`
 - `source venv/bin/activate`
 - `python manage.py runserver 0.0.0.0:8000`
 - visit `http://<your_ip_address>:8000/`

## Configure gunicorn

To test, the command
```
gunicorn --bind 0.0.0.0:8000 backend.wsgi
```
should make it possible to access the app at `http://<your_ip_address>:8000/`

#### Configure systemd to execute gunicorn via a gunicorn.socket file

 - `vim /etc/systemd/system/gunicorn.socket`
with
```
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target
```

and 
- `vim /etc/systemd/system/gunicorn.service`
  with

```
[Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target

[Service]
User=smalldata
Group=www-data
WorkingDirectory=/home/smalldata/smalldata_webserver
ExecStart=/home/smalldata/venv/bin/gunicorn \
          --access-logfile - \
          --workers 3 \
          --bind unix:/run/gunicorn.sock \
          backend.wsgi:application

[Install]
WantedBy=multi-user.target
```
Restart and enable gunicorn:

`systemctl start gunicorn.socket`

`systemctl enable gunicorn.socket`
 
#### Configure Nginx to Proxy Pass to Gunicorn
`vim /etc/nginx/sites-available/smalldata`
with
```bazar
server {
     server_name DOMAIN IP;
     listen 80;

     location = /favicon.ico { access_log off; log_not_found off; }

     location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }
}
```

#### Enable site and configure the Firewall

`sudo ln -s /etc/nginx/sites-available/smalldata /etc/nginx/sites-enabled`

`nginx -t`

`service nginx restart`

`ufw delete allow 8000`

`ufw allow 'Nginx Full'`


Set `DEBUG=False` in `settings.ini` if it isn't already.

`service gunicorn restart`

Restart the server `sudo shutdown -r now`


## Configure daphne
Similiar to the setup of gunicorn, run `vim /etc/systemd/system/daphne.socket` with
```bazaar
[Unit]
Description=daphne socket

[Socket]
ListenStream=/run/daphne.sock

[Install]
WantedBy=sockets.target
```
and  `vim /etc/systemd/system/daphne.service` with
```bazaar
[Unit]
Description=WebSocket Daphne Service
Requires=daphne.socket
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/smalldata/smalldata_webserver

ExecStart=/home/smalldata/venv/bin/python /home/smalldata/venv/bin/daphne --proxy-headers --access-log /home/smalldata/daphne_access.log -u /run/daphne.sock backend.asgi:application -v2
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Allow daphne service through firewall

`ufw allow 8001`

and start / enable daphne:

`systemctl daemon-reload`

`systemctl enable daphne`

`systemctl restart daphne`

`systemctl status daphne`

### Configure nginx to proxy-pass daphne
```bazaar
upstream channels-backend {
 server unix:/run/daphne.sock;
}


server {
    server_name meinungsorgel.de 81.169.142.241;
    listen 80;

    location = /favicon.ico { access_log off; log_not_found off; }
    
     location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;

    #path to proxy my WebSocket requests
    location /ws/ {
 
 	proxy_pass http://channels-backend;
 	proxy_http_version 1.1;
 	proxy_set_header Upgrade $http_upgrade;
 	proxy_set_header Connection upgrade;
 	proxy_redirect off;
 	proxy_set_header Host $host;
 	proxy_set_header X-Real-IP $remote_addr;
 	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
 	proxy_set_header X-Forwarded-Host $server_name;
 	
 	access_log /home/smalldata/nginx_ws.access.log;
 	error_log /home/smalldata/nginx_ws.error.log;
     }    

}
```


## Additional Info
### Notes

- According to the documentation / tutorials, it should be possible to proxy-pass the routes to gunicorn / daphne also via `http`-routes (i.e. `127.0.0.1:8001` instead of `unix:/run/daphne.sock`. This worked on Digital Ocean, however failed on the strato server
- 

### Helpfull commands
 - `systemctl daemon-reload` (must be executed if you change the gunicorn.service file.)

 - `systemctl restart gunicorn / daphne` (If you change code on your server you must execute this to see the changes take place.)

 - `systemctl status gunicorn / daphne`

 - `shutdown -r now` (restart the server)

### Debugging

Here are some commands you can use to look at the server logs. These commands are absolutely crucial to know. If your server randomly isn't working one day, this is what you use to start debugging.

`sudo journalctl` is where all the logs are consolidated to. That's usually where I check.

`sudo tail -F /var/log/nginx/error.log` View the last entries in the error log

`sudo journalctl -u nginx` Nginx process logs

`sudo less /var/log/nginx/access.log` Nginx access logs

`sudo less /var/log/nginx/error.log` Nginx error logs

`sudo journalctl -u gunicorn` gunicorn application logs

`sudo journalctl -u gunicorn.socket` check gunicorn socket logs


### References
 - https://medium.com/codex/deploying-react-through-djangos-static-files-part-1-dev-setup-8a3a7b93c809
 - https://medium.com/swlh/django-rest-framework-and-spa-session-authentication-with-docker-and-nginx-aa64871f29cd
 - https://github.com/mitchtabian/HOWTO-django-channels-daphne
 - https://okbaboularaoui.medium.com/how-to-set-up-django-with-postgres-nginx-and-daphne-django-channels-on-ubuntu-20-04-b0d24dcc7da9