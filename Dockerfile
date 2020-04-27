FROM mhart/alpine-node:12

ADD ./ /app
WORKDIR /app

RUN yarn
RUN yarn build && cd client && yarn build

RUN adduser -D myuser
USER myuser

CMD ["yarn", "start"]

