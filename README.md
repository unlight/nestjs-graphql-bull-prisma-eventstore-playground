# nestjs playground

## Stack

- Nest.js Graphql
- BullMQ
- EventStoreDB (KurrentDB)
- Prisma

## Commands

- npm run start:dev

## Links

- http://localhost:34605/web/index.html#/streams
- http://localhost:3000/graphql
- http://localhost:3000/queues

## TODO

- add search in bull queues
- switch to esm
- match errors
- viewRepository under read/write service
- something with recipe service
- names of services
  - recipe service
  - recipe view repository
  - recipe aggregate repository
  - recipe projection service
  - recipe model service
  - recipe read service
  - recipe write service
  - recipe find service

## Issues

- MongoDB: Unique keys with multiple null values not possible https://github.com/prisma/prisma/discussions/11558 https://github.com/prisma/prisma/issues/3387

## Docker

```
docker build . --progress=plain -t app
docker build -f Dockerfile.debug --no-cache --target=debug .
docker buildx inspect
dive <image-name>
docker images --format "table {{.ID}}\t{{.Repository}}\t{{.Tag}}\t{{.Size}}"
docker run -it -v "$PWD/data":/data -e DATABASE_URL=file:/data/db.sqlite -p 8080:3000 app
docker run -it -p 8080:3000 app
curl -i http://localhost:8080/api
docker run -it app sh
docker run -it --env-file .env app sh
```
