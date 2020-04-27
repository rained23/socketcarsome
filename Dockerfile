FROM mhart/alpine-node:12

ADD ./ /app
WORKDIR /app

RUN yarn && yarn build
RUN cd client && yarn && yarn build

RUN adduser -D myuser
USER myuser

CMD ["yarn", "start:prod"]

