FROM node:22
WORKDIR /usr/src/app

#The package.json and package-lock.json files are copied first to leverage Docker caching and avoid reinstalling dependencies on every build.
COPY package*.json ./

RUN npm install
RUN npm rebuild bcrypt --build-from-source

COPY . .

#Expose the port the app will run on
EXPOSE 8000

#Start the application
CMD ["node", "-r", "dotenv/config", "src/index.js"]
