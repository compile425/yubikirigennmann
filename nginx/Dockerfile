
FROM node:24.5.0-alpine AS react-builder

WORKDIR /app
    
COPY ./frontend/package.json ./frontend/yarn.lock ./
    
RUN yarn install --frozen-lockfile
    
COPY ./frontend/ ./
    
RUN yarn build
    
FROM nginx:1.25-alpine

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
    
COPY --from=react-builder /app/dist /usr/share/nginx/html

EXPOSE 80
    
CMD ["nginx", "-g", "daemon off;"]