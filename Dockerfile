FROM golang:alpine

RUN apk update && apk upgrade && \
    apk add --no-cache git

RUN mkdir /app

WORKDIR /app

ADD go.mod .
ADD go.sum .

RUN go mod download
ADD . .

RUN go build -o ./bin/cookoff-backend ./cmd/main.go

EXPOSE 8080

CMD ["./bin/cookoff-backend"]
