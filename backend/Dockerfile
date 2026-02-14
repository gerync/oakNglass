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
# Copy package metadata and run `npm ci` inside the image. Avoid bind mounts which can
# be unsupported or produce errors in some Podman/BuildKit setups.
COPY backend/package.json backend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
# Copy application config into the image so the runtime doesn't need a host
# mount (avoids Podman rootless permission issues).

# Copy the rest of the source files into the image.
COPY config.json /usr/src/config.json

# Copy backend source files into the image
COPY backend/. ./

# Expose the port that the application listens on.
EXPOSE 10000

# Run the application.
CMD node ./src/index.js
