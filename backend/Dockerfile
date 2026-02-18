# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=24.10.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production


WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Copy package.json first so the layer can be cached even if source files change later.
COPY package.json ./
RUN npm install --omit=dev

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY config.json /usr/src/config.json

# Copy backend source files into the image
COPY backend/. ./

# Copy config.json to parent so config.js (which resolves to ../../config.json) can read it
COPY config.json ../config.json

# Expose the port that the application listens on.
EXPOSE 10000

# Run the application. Enable legacy specifier resolution so extensionless imports work.
ENV NODE_OPTIONS=--experimental-specifier-resolution=node
CMD node ./src/index.js
