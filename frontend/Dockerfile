# ---- Build stage ----
FROM node:22-bullseye AS build
WORKDIR /app

# Másoljuk a package fájlokat és lockfile-t
COPY package*.json ./
COPY yarn.lock ./

# Telepítés
RUN npm ci

# Forráskód másolása
COPY . .

# Angular build
RUN npm run build --prod

# ---- Serve stage ----
FROM nginx:1.25
COPY --from=build /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
