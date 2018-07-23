# Gaia-project

## Node configuration

Use a recent version of node.

On windows, you will probably need to do this in administrator powershell in order to use modules
that are built natively:

```bash
npm install --global --production windows-build-tools
```

## Nginx configuration

In the project's directory:

```bash
sudo cp app/config/nginx /etc/nginx/sites-available/gaia
sudo ln -s /etc/nginx/sites-available/gaia /etc/nginx/sites-enabled/gaia
# Give proper path for public files
sudo sed -i -e 's:root .*;:root '`pwd`'/front/dist;:' /etc/nginx/sites-available/gaia
sudo rm /etc/nginx/sites-enabled/default 
sudo service nginx restart
```

## VS Code

It is recommended to open the main project folder & the front folder into two different VS Code insances.

## Front-end

There is a dedicated front folder, which is an independent module. You need to run npm install there too!

## Testing locally

You will need to create a `.env` file in the project folder, in which you specify a custom domain like localhost. You can use
another domain, but you need to add it to /etc/hosts as a local domain.

You also need to setup nginx, and maybe remove the /etc/nginx/sites-enabled/default!

