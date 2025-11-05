FROM node:22-alpine

WORKDIR /app

COPY pakage*.json ./

RUN npm install


COPY . .

EXPOSE 8081


CMD [ "node", "server.js" ]

