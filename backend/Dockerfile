# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.10.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

WORKDIR /usr/src/app

# Install dependencies
COPY package.json ./
RUN npm install --omit=dev

# Run the application as a non-root user.
USER node

# Copy config and source files
COPY config.json /usr/src/config.json
COPY src/. ./src/

# Expose the port that the application listens on.
EXPOSE 10000

# Run the application. Enable legacy specifier resolution so extensionless imports work.
ENV NODE_OPTIONS=--experimental-specifier-resolution=node
CMD node ./src/index.js
