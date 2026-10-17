-- MySQL
CREATE TABLE `speed_type` (
    `code` ENUM('walking', 'flying', 'swimming', 'burrowing', 'climbing') PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `speed` (
    `creature_id` CHAR(36) NOT NULL,
    `speed_type` VARCHAR(20) NOT NULL,
    `feet_per_round` INT NOT NULL,
    FOREIGN KEY (`creature_id`) REFERENCES `creature` (`creature_id`),
    FOREIGN KEY (`speed_type`) REFERENCES `speed_type` (`code`)
) ENGINE=InnoDB;
