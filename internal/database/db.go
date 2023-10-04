package database

import (
	"database/sql"
	"fmt"
	"log"

	config "github.com/CodeChefVIT/cookoff-backend/config"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

var DB *bun.DB

func ConnectDB(config *config.Config) {
	dsn := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable", config.DBUserName, config.DBUserPassword, config.DBHost, config.DBPort, config.DBName)

	DB = bun.NewDB(sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(dsn))), pgdialect.New())

	if err := DB.Ping(); err != nil {
		log.Fatal("Could not connect to databse")
		log.Printf("DSN = %s", dsn)
	}
}
