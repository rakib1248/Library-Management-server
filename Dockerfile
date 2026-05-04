FROM node:22-alpine

# Prisma-র জন্য openssl, pnpm ইনস্টল
RUN apk add --no-cache openssl && npm install -g pnpm

WORKDIR /app

# ডিপেন্ডেন্সি লেয়ার (ক্যাশ অপ্টিমাইজড)
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

# সোর্স কোড কপি
COPY . .

# Prisma client generate ও build
RUN pnpm prisma generate
RUN pnpm run build

# Non-root user (সিকিউরিটি)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/src/main.js"]