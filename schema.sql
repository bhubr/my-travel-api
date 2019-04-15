create table user (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  login VARCHAR(40),
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  email VARCHAR(100),
  apiKey VARCHAR(64)
);

create table photo (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  authorId INTEGER NOT NULL,
  title VARCHAR(100),
  picture VARCHAR(150),
  country VARCHAR(50),
  approved BOOLEAN DEFAULT 0,
  `date` DATE
);

create table tag (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  approved BOOLEAN DEFAULT 0
);

create table photo_tag (
  id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
  photoId INTEGER NOT NULL,
  tagId INTEGER NOT NULL
);