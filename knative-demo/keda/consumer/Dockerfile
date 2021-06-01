FROM --platform=linux/amd64 node:14-alpine3.12
ARG GNUMAKEFLAGS=--max-load
COPY . /app
WORKDIR /app
ENV PORT 8080
EXPOSE 8080
RUN npm ci
CMD [ "node", "index.js" ]