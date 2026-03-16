# Étape 1 : Build
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Déclarant les arguments AVANT le build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Passage en variables d'environnement pour le processus 'npm run build'
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# Étape 2 : Nginx
FROM nginx:stable-alpine
# On vide le dossier par défaut de nginx
RUN rm -rf /usr/share/nginx/html/*
# On copie ton build
COPY --from=build /app/dist /usr/share/nginx/html
# On copie TA config nginx (celle de ta photo image_ad98ba.jpg)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]