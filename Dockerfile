# Only to build the project
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# To actually deploy the project WITHOUT including all the source code in typescript, 
# only the compiled JavaScript code, making the image smaller
FROM node:18

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD [ "npm", "run", "serve" ]