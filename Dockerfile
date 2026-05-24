FROM node:25-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm install

FROM deps AS build
COPY backend ./backend
COPY frontend ./frontend
RUN npm run build

FROM node:25-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4173
ENV HOST=0.0.0.0
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend ./backend
COPY --from=build /app/frontend/dist ./frontend/dist
RUN mkdir -p /app/data

EXPOSE 4173

CMD ["npm", "run", "start"]
