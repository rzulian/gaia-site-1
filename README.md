# Gaia-project

## MongoDB

The site needs a mongodb backend running. It can be local or remote. See the 'environment' section in this README on how to configure environment variables. By default it uses a local mongodb database running on port 27017 with no authentication.

## Node configuration

Use a recent version of node.

On windows, you will probably need to do this in administrator powershell in order to use modules
that are built natively:

```bash
npm install --global --production windows-build-tools
```

## Nginx configuration

**Note:** nginx may not be necessary anymore in development, if you don't care about websockets / chat.

In the project's directory:

```bash
sudo cp app/config/nginx /etc/nginx/sites-available/gaia-project
sudo ln -s /etc/nginx/sites-available/gaia-project /etc/nginx/sites-enabled/gaia-project
# Give proper path for public files
sudo sed -i -e 's:root .*;:root '`pwd`'/front/dist;:' /etc/nginx/sites-available/gaia-project
sudo rm /etc/nginx/sites-enabled/default 
sudo service nginx restart
```

You may have a 403 forbidden error regarding js and css files if the folder is under your home folder, then you need to either give more permissions to your home folder or move the project elsewhere. You can give nginx permissions like this: `sudo usermod -G <your-user-name> -a 'www-data'`

## VS Code

It is recommended to open the main project folder & the front folder into two different VS Code insances.

## Front-end

There is a dedicated front folder, which is an independent module. You need to run `yarn install` there too!

## Testing locally

You will need to create a `.env` file in the project folder, in which you specify a custom domain like localhost. You can use
another domain, but you need to add it to /etc/hosts as a local domain.

You **may** also need to setup nginx / remove the /etc/nginx/sites-enabled/default!

## Environment

Most of the configurable environment variables are shown in `app/config/env.ts`. You just need to create a `.env` file at the root of the project with the changed environement variables.

For example:

```bash
#.env file
NODE_ENV=production
inviteOnly=true
automatedEmails=true
sessionSecret=customSessionSecret
domain=my-domain.com
```

For client changes, you need to create **another** `.env` file in the front folder. Client environment variables:

- VUE_APP_inviteOnly : Make the UI only allow new accounts from invitations

For examples:

```bash
#front/.env file
VUE_APP_inviteOnly=true
```
