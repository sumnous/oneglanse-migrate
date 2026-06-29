FROM node:20
RUN npm install -g pg
COPY migrate.js /migrate.js
COPY migration.sql /migration.sql
CMD ["node", "/migrate.js"]
