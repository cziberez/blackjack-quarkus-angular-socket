# ---- Build stage ----
FROM node:22-bullseye AS build
WORKDIR /app

# Másoljuk a package fájlokat és lockfile-t, ha van
COPY package*.json ./
COPY yarn.lock ./

# Telepítés
RUN npm ci

# Másoljuk a teljes frontend mappát
COPY . .

# Angular build
RUN npm run build --prod

# ---- Serve stage ----
FROM nginx:1.25
WORKDIR /usr/share/nginx/html

# Másoljuk a buildelt fájlokat
COPY --from=build /app/dist/frontend .

# Másoljuk az nginx konfigurációt
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
