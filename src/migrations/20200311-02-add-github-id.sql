ALTER TABLE user ADD COLUMN githubId INTEGER NOT NULL DEFAULT 1 AFTER id;

UPDATE user SET githubId = 15270070 WHERE id = 1;