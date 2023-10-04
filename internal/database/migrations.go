package database

import (
	"log"

	"gorm.io/gorm"
)

func RunMigrations(db *gorm.DB) {
	log.Println("Running Migrations")
	log.Println("Migrations Complete")
}
