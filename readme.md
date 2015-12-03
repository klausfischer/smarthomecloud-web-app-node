# Azure Web App with Node.js

This project is similar to the sample project [Node.js web app using the Azure Table Service](https://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-use-table-storage-web-site/) done with [express-generator@4.13.1](https://www.npmjs.com/package/express-generator) and [bootstrap#4.0.0-alpha](https://github.com/twbs/bootstrap) available via [bower.io](http://www.bower.io) although statically included (ugly) now.

The Website connects to a REST API running in the Azure Cloud, to display temperature data which will be measured by a Raspberry Pi. So this project is JUST the website for displaying the data and should help you get your Azure Web App running :)

## Installation

- clone the repo
- ``cd smarthomecloud-web-app-node``
- ``npm install`` 
- create a file ``config.json`` in the *parent* directory of ``smarthomecloud-web-app-node`` for local development (see [this section](https://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-use-table-storage-web-site/#create-a-config-file)) to connect to your Azure Storage Account (i guess your account data shouldn't be versioned, that's why it's in the parent dir)

## Developing locally

- ``npm run-script dev`` (see what it does in the ``package.json``)
- open your browser: ``http://localhost:3000``

## Deploy on Azure cloud

- after cloning the repo setup a Git remote called ``azure`` and wire it up correctly following [this guide](https://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-use-table-storage-web-site/#deploy-your-application-to-azure)
- have an eye on the log messages when pushing to the ``azure`` branch, you might encounter useful help there. 
- don't forget to setup the correct environment variables in the [portal](http://portal.azure.com)
- note on Azure: when pushing to the ``azure`` branch, iisnode (the IIS module running your node.js app) will look into your package.json and use the start-up script index.js. So the local startup is different than the deployed one
- to disable error messages edit `ìisnode.yml``


## Logging

- On the [portal](http://portal.azure.com) navigate into your web app - Settings - Diagnostic logs where you can enable them
