---
layout: post
title:  "Setting up Composer inside a Docker container"
date:   2019-04-16 10:00:00 +0300
tags:   docker composer php
image:  /images/docker-compose-composer.png
---

A simple way to have properly working Composer inside your Docker container (plus a nice bonus at the end).

<!--more-->

Usually when you put your PHP installation into Docker, you don't want to keep your Composer around in your system any more. You want to put it into Docker too.

There are some Composer images for Docker available out there but they run Composer in a separate container. Running it like that is the same as running Composer and your code on different systems, it makes the setup inconsistent and probably even broken since Composer checks your PHP version, installed extensions and may execute additional scripts, which may not affect the other container.

The solution is pretty easy: just add Composer into your main PHP container image.
This way Composer will run on the exact same system that will execute your code. The PHP version, installed extensions and all other stuff will be the same.

### Here's a quick example

In your PHP image, make sure you have installed all required system packages. Aside from PHP installation itself, we will need `wget`, and also `git`, `ssh`, and `less` are usually required to properly run Composer, but it depends on the way you run it.

After that, just run the standard Composer installation procedure and put the Composer file into the `/usr/local/bin/composer` directory inside the container.

>Dockerfile
{:.filename}
```bash
FROM php:7.1-fpm

# Install dependencies
RUN buildDeps=" \
        wget \
        git \
        ssh \
        less \
    "; \
    set -x \
    && apt-get update && apt-get install -y $buildDeps --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Composer
RUN wget https://getcomposer.org/installer -O - -q | php -- --quiet && \
    mv composer.phar /usr/local/bin/composer

```

That's it! Now you can bring your container up as usual, log into it and execute any composer commands like you used to do on your own system.

If you use [Docker Compose](https://docs.docker.com/compose/){:target="_blank"}, it becomes very easy to run Composer without having to log into the running container, simply execute `docker-compose exec YOUR_PHP_SERVICE_NAME composer --version` and you should get the version of the installed Composer instance.

Now one more thing: your composer commands will run under the container's `root` user, which is not a right thing to do even inside the container. But it's easy to fix by adding `--user www-data` argument to your `docker-compose exec` command.

### Authentication

Often we use private repositories or even private Packagist instances to host our Composer dependencies. Not everything is open-source in our world.

By moving our Composer into a Docker container, we denied it the access to our security credentials. But we can easy fix this by forwarding them into the container.

Here's an example:

>docker-compose.yml
{:.filename}
```yaml
version: '3'
services:
  app:
    build: .
    volumes:
      - ~/.ssh:/root/.ssh:ro
      - ~/.composer/auth.json:/root/.composer/auth.json
      - "${SSH_AUTH_SOCK}:${SSH_AUTH_SOCK}:ro"
    environment:
      - SSH_AUTH_SOCK="${SSH_AUTH_SOCK}" 
```

Just four lines are important here:

* Volume `~/.ssh:/root/.ssh:ro` mounts your `~/.ssh` directory into the container's `/root/.ssh` (`:ro` flag means "read-only"). This will let Composer inside the container access your SSH configuration and keys. If you running composer as a different user, change `/root/` to the user's home directory path.
* Volume `~/.composer/auth.json:/root/.composer/auth.json` mounts your `~/.composer/auth.json` file that contains private Packagist authentication credentials into the container. If you running composer as a different user, change `/root/` to the user's home directory path. If you don't have this file on your own system, comment out this volume or create a `~/.composer/auth.json` file containing `{}` first, or else Docker will create a directory on it's place.
* Volume `"${SSH_AUTH_SOCK}:${SSH_AUTH_SOCK}:ro"` can be used if you're running `ssh-agent` (or forwarding the agent from another machine). If you don't, just comment out this volume. It mounts your current SSH Auth Socket file into the container, using the same file path.
* And finally, we define an environment variable `SSH_AUTH_SOCK` in our container, that will contain the path to the SSH Auth Socket.


### Bonus

And now, as a bonus, here's a very simple script that you can put beside your `docker-compose.yml` file and use it just as a good-old composer file:

>./composer
{:.filename}
```bash
#!/usr/bin/env sh

docker-compose exec --user www-data YOUR_PHP_SERVICE_NAME /usr/local/bin/composer $@
```

Just replace `YOUR_PHP_SERVICE_NAME` with the name of your PHP service defined in your `docker-compose.yml`, make it executable and now you can use it just like that: `./composer --version`. It will run the composer installed in your running docker container and execute everything from the `www-data` user.

Feel free to modify this script to your needs and don't forget to include it into your Git repository so other developers working on your project can use it too.


