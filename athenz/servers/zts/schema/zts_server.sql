-- MySQL Script generated by MySQL Workbench
-- Mon Apr 27 17:58:12 2020
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema zts_store
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema zts_store
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `zts_store` DEFAULT CHARACTER SET utf8 ;
USE `zts_store` ;

-- -----------------------------------------------------
-- Table `zts_store`.`certificates`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zts_store`.`certificates` (
  `provider` VARCHAR(384) NOT NULL,
  `instanceId` VARCHAR(256) NOT NULL,
  `service` VARCHAR(384) NOT NULL,
  `currentSerial` VARCHAR(128) NOT NULL,
  `currentTime` DATETIME(3) NOT NULL,
  `currentIP` VARCHAR(64) NOT NULL,
  `prevSerial` VARCHAR(128) NOT NULL,
  `prevTime` DATETIME(3) NOT NULL,
  `prevIP` VARCHAR(64) NOT NULL,
  `clientCert` TINYINT(1) NOT NULL DEFAULT 0,
  `lastNotifiedTime` DATETIME(3) NULL,
  `lastNotifiedServer` VARCHAR(512) NULL,
  `expiryTime` DATETIME(3) NULL,
  `hostName` VARCHAR(512) NULL,
  PRIMARY KEY (`provider`, `instanceId`, `service`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `zts_store`.`ssh_certificates`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `zts_store`.`ssh_certificates` (
  `instanceId` VARCHAR(256) NOT NULL,
  `service` VARCHAR(384) NOT NULL,
  `principals` VARCHAR(1024) NOT NULL DEFAULT '',
  `clientIP` VARCHAR(64) NOT NULL DEFAULT '',
  `privateIP` VARCHAR(64) NOT NULL DEFAULT '',
  `issueTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`instanceId`, `service`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
