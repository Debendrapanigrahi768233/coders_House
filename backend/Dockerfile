FROM node:16
WORKDIR /backend/
COPY package*.json /backend/
RUN npm install
COPY . .
EXPOSE 5500
CMD [ "npm", "run", "start" ]
