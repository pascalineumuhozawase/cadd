FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./server.js
COPY src ./src

RUN mkdir -p /app/uploads
EXPOSE 5000

CMD ["npm", "start"]