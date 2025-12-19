FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS build
USER root
RUN command -v yarn || npm i -g yarn

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN yarn install --frozen-lockfile && yarn build

FROM registry.access.redhat.com/ubi9/nginx-120:latest
COPY default.conf "${NGINX_CONFIGURATION_PATH}"
COPY --from=build /usr/src/app/dist /opt/app-root/src
USER 1001
CMD /usr/libexec/s2i/run
