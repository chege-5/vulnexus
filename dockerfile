#docker file for react.js
FROM node:22 as build

WORKDIR /systemF

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


FROM nginx:alpine

COPY --from=build /systemF/dist /usr/share/nginx/html

EXPOSE 80
