#!/bin/bash

#
# This is a bit brutal (and will affect your system if you are running other
# containers than those of the lab)
#
echo ""
echo ""
echo "*** Killing all running containers"
echo ""
sudo docker kill $(sudo docker ps -a -q)
sudo docker rm $(sudo docker ps -a -q)

#
# Let's get rid of existing images...
#
echo ""
echo ""
echo "*** Deleting our 3 Docker images, if they exist"
echo ""
sudo docker rmi res/auditor
sudo docker rmi res/musician
sudo docker rmi res/validate-music
	
#
# ... and rebuild them
#
echo ""
echo ""
echo "*** Rebuilding our 3 Docker images"
echo ""
sudo docker build --tag res/musician --file ./docker/image-musician/Dockerfile ./docker/image-musician/
sudo docker build --tag res/auditor --file ./docker/image-auditor/Dockerfile ./docker/image-auditor/
sudo docker build --tag res/validate-music --file ./docker/image-validation/Dockerfile ./docker/image-validation/

#
# We start a single container. The Node.js application executed in this container will use
# a npm package to control Docker. It will start/stop musician and auditor containers and check that
# the auditor works as expected.
#
echo ""
echo ""
echo "*** Starting validation..."
echo ""
git remote -v | tee check.log
sudo docker run --name res_validation -v /var/run/docker.sock:/var/run/docker.sock res/validate-music | tee -a check.log



