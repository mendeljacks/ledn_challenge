import { mysql } from "./mysql"

export const migrations = `
CREATE SCHEMA db;

CREATE TABLE db.users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    referredBy INT NULL,
    email VARCHAR(80) NOT NULL,
    firstName VARCHAR(45) NOT NULL,
    lastName VARCHAR(45) NOT NULL,
    country VARCHAR(2) NOT NULL,
    dob DATE NOT NULL,
    mfa VARCHAR(45) NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE,
    UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE);

ALTER TABLE db.users 
    CHANGE COLUMN referredBy referredBy INT UNSIGNED NULL DEFAULT NULL ,
    ADD INDEX fk_referred_by_idx (referredBy ASC) VISIBLE;

ALTER TABLE db.users 
    ADD CONSTRAINT fk_referred_by
    FOREIGN KEY (referredBy)
    REFERENCES db.users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

CREATE TABLE db.transactions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    userId INT UNSIGNED NULL,
    amount INT(12) NULL,
    type ENUM("send", "receive") NULL,
    createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE,
    INDEX fk_user_id_idx (userId ASC) VISIBLE,
    CONSTRAINT fk_user_id
    FOREIGN KEY (userId)
    REFERENCES db.users (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

ALTER TABLE db.transactions 
    DROP FOREIGN KEY fk_user_id;
    ALTER TABLE db.transactions 
    CHANGE COLUMN userId userId INT UNSIGNED NOT NULL ,
    CHANGE COLUMN type type ENUM('send', 'receive') NOT NULL ,
    CHANGE COLUMN createdAt createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ;
    ALTER TABLE db.transactions 
    ADD CONSTRAINT fk_user_id
    FOREIGN KEY (userId)
    REFERENCES db.users (id);

    ALTER TABLE db.users 
    DROP FOREIGN KEY fk_referred_by;
    ALTER TABLE db.users 
    CHANGE COLUMN referredBy referredBy VARCHAR(80) NULL DEFAULT NULL ,
    DROP INDEX fk_referred_by_idx ;

    ALTER TABLE db.users
    ADD COLUMN resourceId VARCHAR(45) NOT NULL AFTER updatedAt,
    ADD UNIQUE INDEX resourceId_UNIQUE (resourceId ASC) VISIBLE;

    ALTER TABLE db.transactions
    ADD COLUMN resourceId VARCHAR(45) NOT NULL AFTER createdAt,
    ADD UNIQUE INDEX resourceId_UNIQUE (resourceId ASC) VISIBLE;
   
`

export const initDb = async () => {
    await mysql.query('DROP DATABASE if exists db')
    await mysql.query(migrations)
}