FROM node:8
MAINTAINER Rosy-Laure Wonjamouna <rosy-laure.wonjamouna@heig-vd.ch>


#
# When we build the image, we copy the executable jar in the image file system. 
#
COPY src /opt/app/
WORKDIR /opt/app/
RUN npm install

CMD ["node", "/opt/app/auditor.js"]
