FROM node:8
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y texlive texlive-fonts-extra texlive-lang-german pandoc
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 3000
CMD [ "node", "server.js" ]
