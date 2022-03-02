FROM node:12

# Create app directory
WORKDIR /usr/src/app/vegas_service

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN yarn install

# Bundle app source
COPY . .

ENV secretKey=""

# If you are building your code for production
# RUN npm ci --only=production
CMD node index.js $secretKey
