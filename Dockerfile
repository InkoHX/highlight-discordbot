FROM node:14-alpine

ENV WORKDIR_PATH "/inkohx/app/highlight-discordbot"

COPY . ${WORKDIR_PATH}

WORKDIR ${WORKDIR_PATH}

RUN yarn install && \
  yarn run compile && \
  yarn install --prod && \
  yarn cache clean

ENTRYPOINT [ "yarn", "start" ]
