FROM node:10

# Create app directory
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 3000
CMD [ "node", "server.js" ]