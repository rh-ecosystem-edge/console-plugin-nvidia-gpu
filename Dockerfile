
FROM quay.io/coreos/tectonic-console-builder:v23 AS build

RUN npm install -g n
RUN n lts

ADD . /usr/src/app
WORKDIR /usr/src/app
RUN yarn install && yarn build

EXPOSE 9001
ENTRYPOINT [ "./http-server.sh", "./dist" ]
