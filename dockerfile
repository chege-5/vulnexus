#docker file for react.js
FROM node:22 as build

ARG VITE_API_BASE_URL=http://localhost:8000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /systemF

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


FROM nginx:alpine

COPY --from=build /systemF/dist /usr/share/nginx/html

EXPOSE 80
