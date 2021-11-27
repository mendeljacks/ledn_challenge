import { mysql } from "./mysql"

export const migrations = `
CREATE SCHEMA db;

CREATE TABLE db.users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    referred_by INT NULL,
    email VARCHAR(80) NOT NULL,
    first_name VARCHAR(45) NOT NULL,
    last_name VARCHAR(45) NOT NULL,
    country VARCHAR(2) NOT NULL,
    dob VARCHAR(24) NOT NULL,
    mfa VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE,
    UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE);

ALTER TABLE db.users 
    CHANGE COLUMN referred_by referred_by INT UNSIGNED NULL DEFAULT NULL ,
    ADD INDEX fk_referred_by_idx (referred_by ASC) VISIBLE;

ALTER TABLE db.users 
    ADD CONSTRAINT fk_referred_by
    FOREIGN KEY (referred_by)
    REFERENCES db.users (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION;

CREATE TABLE db.transactions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NULL,
    amount DECIMAL(10,2) NULL,
    type ENUM("send", "receive") NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE,
    INDEX fk_user_id_idx (user_id ASC) VISIBLE,
    CONSTRAINT fk_user_id
    FOREIGN KEY (user_id)
    REFERENCES db.users (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE db.transactions 
    DROP FOREIGN KEY fk_user_id;
    ALTER TABLE db.transactions 
    CHANGE COLUMN user_id user_id INT UNSIGNED NOT NULL ,
    CHANGE COLUMN amount amount DECIMAL(10,2) NOT NULL ,
    CHANGE COLUMN type type ENUM('send', 'receive') NOT NULL ,
    CHANGE COLUMN created_at created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ;
    ALTER TABLE db.transactions 
    ADD CONSTRAINT fk_user_id
    FOREIGN KEY (user_id)
    REFERENCES db.users (id);
          
`

export const initDb = async () => {
    await mysql.query('DROP DATABASE if exists db')
    await mysql.query(migrations)
}