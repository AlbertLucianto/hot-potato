# stop all running containers
docker stop $(docker ps -a -q)

# remove all running containers
docker rm $(docker ps -a -q)

# remove all dangling volumes
docker volume rm `docker volume ls -q -f dangling=true`