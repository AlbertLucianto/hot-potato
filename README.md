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
3. Install graphcool-cli with `npm install -g graphcool`.
4. Run `gc local up <any_name_for_cluster>`. It will create three docker containers, including MySQL database.
5. Run `gc deploy`.
6. **If `.graphcoolrc` file is not yet there, it will ask you to choose a cluster, and automatically create the file. Else, delete `.graphcoolrc` file as it may fail the setup**

#### Re-Deployment

Some changes in graphql type schema may break something and difficult to fix. You can create a fresh cluster by deleting the old and create the new one.

To delete the containers, run:

```shell
# stop all running containers
docker stop $(docker ps -a -q)

# remove all running containers
docker rm $(docker ps -a -q)
```

But, you may encounter this error when deploying with the same project name: `project <project_name> already exists`. It was caused by dangling volume in docker.

Thus, to clear them, lastly run: **warning: it will also clear other docker containers**

```shell
# remove all dangling volumes
docker volume rm `docker volume ls -q -f dangling=true`
```

## Access MySQL in local deployment

It is not recommended since graphcool uses its own hashing for its database implementation, thus it's not readable.

However you do so by:

1. List running docker container `docker ps`. Check for the mysql container ID.
2. Run `docker exec -it <CONTAINER_ID> sh`. Then do `mysql -u root -p`.
3. Type `graphcool` when prompted for password.
4. That's it!