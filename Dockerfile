FROM node:20-alpine
RUN npm install -g pg
COPY migrate.js /migrate.js
COPY migration.sql /migration.sql
CMD ["node", "/migrate.js"]
