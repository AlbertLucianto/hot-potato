# Hot Potato Game

## Overview

> Hot potato is a simple game inpsired (or cloned to be exact) by Google internal tool. Players simply can create and pass potato to anyone for a limited time, otherwise they will drop it.

## Dependencies

### Server

* GraphQL
* Graphcool
* Docker
* TypeScript

### Database (handled by Graphcool)

* MySQL

### Client

_Not yet under development. Most probably using VueJS_

## Local Deployment

### Server

1. Set `server` as current working directory.
2. Ensure docker is installed on the machine. Run it.
3. Run `graphcool local up <any_name_for_cluster>`. It will create three docker containers, including MySQL database.
4. Run `graphcool deploy`.
5. **If `.graphcoolrc` file is not yet there, it will ask you to choose a cluster, and create the file. Else, delete `.graphcoolrc` file as it may fail the setup**

## Access MySQL in local deployment

It is not recommended since graphcool uses its own hashing for its database implementation, thus it's not readable.

However you do so by:

1. List running docker container `docker ps`. Check for the mysql container ID.
2. Run `docker exec -it <CONTAINER_ID> sh`. Then do `mysql -u root -p`.
3. Type `graphcool` when prompted for password.
4. That's it!