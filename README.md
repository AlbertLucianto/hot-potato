<p align="center"><img width="600" src="/client/static/hot_potato_logo.png" alt="Hot Potato Game logo"></p>



# Overview

> Hot potato is a simple game inpsired (or cloned to be exact) by Google internal tool. Players simply can create and pass potato to anyone for a limited time, otherwise they will drop it.

### [Live Demo](https://albertlucianto.github.io/hot-potato)

# Dependencies

## Server

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a href="https://github.com/graphql/graphql-js">
          <img width="180" src="https://marmelab.com/images/blog/graphql/logo.png" alt="GraphQL">
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://github.com/graphcool/graphcool">
          <img width="220" src="http://mvp-space.com/img/partners/graphcool.svg" alt="Graphcool">
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://www.docker.com/">
          <img width="180" src="https://www.fullstackpython.com/img/logos/docker-wide.png" alt="Docker">
        </a>
      </td>
      <td align="center" valign="middle">
        <a href="https://www.typescriptlang.org/">
          <img width="120" src="https://d33wubrfki0l68.cloudfront.net/0579d394494deca6039254f27da3036f05a7ea05/8e284/images/typescript.png" alt="TypeScript">
        </a>
      </td>
    </tr>
  </tbody>
</table>




## Client

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a href="https://vuejs.org/">
          <img width="250" src="https://user-images.githubusercontent.com/7110136/29002856-9a237b36-7ab4-11e7-9f51-a0521d5c7a9b.png" alt="VueJS">
        </a>
      </td>
      <td align="center" valign="middle" width="250">
        <a href="https://www.apollographql.com">
          <img width="200" src="http://optics-docs.apollodata.com/images/logo-apollo-space-left.svg" alt="Apollo Client">
        </a>
      </td>
      <td align="center" valign="middle" width="200">
        <a href="https://github.com/Akryum/vue-apollo">
          <h2>Vue Apollo</h2>
        </a>
      </td>
    </tr>
  </tbody>
</table>


## Database

_Database is configured by Graphcool Framework by default_

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <a href="https://www.mysql.com/">
          <img width="150" src="https://upload.wikimedia.org/wikipedia/en/thumb/6/62/MySQL.svg/1200px-MySQL.svg.png">
        </a>
      </td>
    </tr>
  </tbody>
</table>

# Deployment

## Server

_If any version of `graphcool` is installed on your machine, uninstall it using `npm uninstall -g graphcool`. It's package name is now changed to `graphcool-framework`._

1. Install graphcool-cli with `npm install -g graphcool-framework`.
2. It is suggested to make an alias of `graphcool-framework` command to `gc`. For MacOS, can configure it in `~/.bash_profile`.

___From here, every command of `gc` refers to `graphcool-framework`.___

### Local

1. Set `server` as current working directory.
2. Ensure docker is installed on the machine. Run it.
3. 
4. Run `gc local up --name <any_name_for_cluster>`. It will create three docker containers, including MySQL database.
5. Run `gc deploy`.
6. **If `.graphcoolrc` file is not yet there, it will ask you to choose a cluster, and automatically create the file. Else, delete `.graphcoolrc` file as it may fail the setup**

## Client

1. **Make sure you have set up the server**
2. Set `server` as current working directory.
3. Get the server api url by running `gc info`, it will print out list of API and Endpoints. Copy the endpoint with `Simple` API.
4. Go to `client/config` as working directory.
5. Duplicate file `apollo.config.template.js` and change the name into `apollo.config.js`
6. Set the `uri` to the endpoint just copied.
7. Run dev server with `npm run dev`.

## Re-Deployment

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

# or for Graphcool 1.0
gc local nuke
```

# Access MySQL in local deployment

It is not recommended since graphcool uses its own hashing for its database implementation, thus it's not readable.

However you do so by:

1. List running docker container `docker ps`. Check for the mysql container ID.
2. Run `docker exec -it <CONTAINER_ID> sh`. Then do `mysql -u root -p`.
3. Type `graphcool` when prompted for password.
4. That's it!
