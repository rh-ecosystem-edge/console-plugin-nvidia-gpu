
FROM registry.access.redhat.com/ubi8/nodejs-18:latest AS builder
USER root
RUN npm install -g corepack
RUN corepack enable yarn

COPY . /opt/app-root/src
RUN yarn config set network-timeout 300000
RUN yarn global add node-gyp
RUN yarn install && yarn build

FROM registry.access.redhat.com/ubi9/nginx-120:latest
COPY default.conf "${NGINX_CONFIGURATION_PATH}"
COPY --from=builder /opt/app-root/src/dist .
USER 1001
CMD /usr/libexec/s2i/run
