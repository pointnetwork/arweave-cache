FROM node:16

WORKDIR /app
COPY . /app/

RUN npm i && npm run build
RUN npm install pm2 -g

ENTRYPOINT [ "npm", "start" ]
