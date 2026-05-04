FROM node:22-alpine


RUN apk add --no-cache openssl && npm install -g pnpm

WORKDIR /app


COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile


COPY . .

RUN pnpm prisma generate
RUN pnpm run build


RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/src/main.js"]