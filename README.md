# Govi Project - Landing page

This template is a starting point for landingpage of the Govi Project.


### Setup

##### Prerequisites

Install [polymer-cli](https://github.com/Polymer/polymer-cli):

    npm install -g polymer-cli

##### Initialize project from template

    git clone https://github.com/horacioibrahim/home-govi.git
    cd reponame

### Start the development server

This command serves the app at `http://localhost:8080` and provides basic URL
routing for the app:

    polymer serve --open


### Build

In addition the command also creates a bundled `dist` folder,
generated using fragment bundling, suitable for serving from non
H2/push-compatible servers or to clients that do not support H2/Push.

    polymer build

### Preview the build

This command serves the minified version of the app at `http://localhost:8080`
in an unbundled state, as it would be served by a push-compatible server:

    polymer serve build/unbundled [optional]

This command serves the minified version of the app at `http://localhost:8080`
generated using fragment bundling:

    polymer serve dist

### Run tests

This command will run
[Web Component Tester](https://github.com/Polymer/web-component-tester) against the
browsers currently installed on your machine.

    polymer test