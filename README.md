## notobo

Converts packages installed by npm into a layout that works best for
browser-based module loaders (base URL + moduled ID + '.js'), but also still
works in Node.

By default it also converts the .js file in the package to AMD-wrapped
resources. As the ES6 module loader API matures, it could have an option to
convert the traditional node style modules to a format that works with the ES6
loader.

## Prerequisites

* Uses node 0.10 or later.

## Installation

    npm install -g notobo

## Usage

    notobo [dirname]

* If dirname does not exist, creates a notobo-enabled project directory.
* If dirname exists, then looks in node_modules, converts existing code, and
sets up the directory to be notobo-enabled.

Once a project is notobo-enabled, any new npm-installed resources will
automatically get the notobo treatment. Furthermore, the project will be set
up so that it can easily be used by an AMD loader and optimized with an
AMD-aware optimizer, like [r.js](http://requirejs.org/docs/optimization.html).

## Restrictions

notobo only sets up the node_modules packages that are direct children of
node_modules, it does not set up nested node_modules dependencies, as that
is not a good idea for front end development.

You can use [node-dedupe]() to make sure as much of the dependencies can
be top level node_modules packages.

## What does it do?

* install amdefine
* install requirejs
* install browser-builtins for the browser shims for node modules.
* Sets up an install hook in the node_modules directory.
* Adds some devDependencies to the project's package.json.
* Sets up a package.json install command, so that if someone clones the project
and does `npm install`, the project will be set up correctly.