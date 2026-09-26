FROM node:lts AS runtime
WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

RUN npm install -g npm@latest