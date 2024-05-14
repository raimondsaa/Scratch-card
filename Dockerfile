FROM node:18-bullseye
WORKDIR /app
COPY package*.json ./


COPY . . 
RUN npm install
EXPOSE 3000
RUN npm rebuild

CMD npm run build
