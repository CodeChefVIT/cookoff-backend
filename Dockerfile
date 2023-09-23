# Use an official Node.js runtime as the base image
FROM --platform=linux/amd64 node:18
# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app's source code to the container
COPY . .

# Expose the port that the app will run on
EXPOSE 8080

# Install PM2 globally
RUN npm install pm2 -g

# Use PM2 as the command to run the app, with automatic restart on failure
CMD ["pm2-runtime", "index.js"]
