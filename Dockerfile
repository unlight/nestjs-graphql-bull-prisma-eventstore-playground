# +-+-+-+-+ +-+-+-+-+-+
# |B|A|S|E| |S|T|A|G|E|
# +-+-+-+-+ +-+-+-+-+-+
FROM alpine:3.22 AS base
RUN apk add --no-cache --update nodejs=22.16.0-r2
WORKDIR /app

# +-+-+-+-+-+ +-+-+-+-+-+
# |B|U|I|L|D| |S|T|A|G|E|
# +-+-+-+-+-+ +-+-+-+-+-+
FROM base AS build

# Install tools
RUN apk add --no-cache npm jq && rm -rf /var/cache/apk/*

# Install dependencies
COPY . .
RUN npm ci

# Build sources
RUN npm run build
RUN mkdir -p /app/build_modules/@nestjs-steroids
RUN cp -r /app/node_modules/.prisma /app/build_modules
RUN cp -r /app/node_modules/@nestjs-steroids/environment /app/build_modules/@nestjs-steroids # Remove if replace by @pietrobassi/environment
RUN npm ci --omit=dev --ignore-scripts
RUN npx clean-modules --yes
RUN npx clean-modules --yes --directory build_modules

# +-+-+-+-+-+-+-+-+-+-+ +-+-+-+-+-+
# |P|R|O|D|U|C|T|I|O|N| |S|T|A|G|E|
# +-+-+-+-+-+-+-+-+-+-+ +-+-+-+-+-+
FROM base
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/build_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/build_modules/@nestjs-steroids/environment /app/node_modules/@nestjs-steroids/environment
#RUN ls -a ./node_modules/.prisma
#RUN ls -a ./node_modules/@nestjs-steroids/environment
COPY --from=build /app/dist/*.js /app/main.js

CMD ["node", "/app/main.js"]
