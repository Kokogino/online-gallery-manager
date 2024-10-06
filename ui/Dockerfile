FROM node:20.17.0-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli
COPY . .
RUN ng build --configuration=production

FROM nginx:latest
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build app/dist/ui/browser /usr/share/nginx/html
EXPOSE 80
