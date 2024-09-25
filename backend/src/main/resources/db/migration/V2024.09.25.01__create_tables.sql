CREATE COLLATION case_insensitive_ignore_accents (provider = icu, deterministic = false, locale = 'und-u-ks-level1');

CREATE TYPE image_host AS ENUM ('IMGBOX');
CREATE TYPE metadata_type AS ENUM ('STRING', 'DATE', 'INTEGER', 'DOUBLE');

CREATE TABLE tag
(
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(50) COLLATE case_insensitive_ignore_accents NOT NULL,
  show_tag   BOOLEAN DEFAULT false,
  created_at TIMESTAMP                                           NOT NULL,
  updated_at TIMESTAMP                                           NOT NULL
);

CREATE TABLE gallery
(
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(255) NULL,
  edit_url   TEXT         NULL,
  host       image_host   NOT NULL,
  created_at TIMESTAMP    NOT NULL,
  updated_at TIMESTAMP    NOT NULL
);

CREATE TABLE gallery_metadata
(
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(50) COLLATE case_insensitive_ignore_accents NOT NULL,
  type       metadata_type                                       NOT NULL,
  created_at TIMESTAMP                                           NOT NULL,
  updated_at TIMESTAMP                                           NOT NULL
);

CREATE TABLE gallery_metadata_entry
(
  id                  BIGSERIAL PRIMARY KEY,
  gallery_id          BIGINT REFERENCES gallery ON DELETE CASCADE          NOT NULL,
  gallery_metadata_id BIGINT REFERENCES gallery_metadata ON DELETE CASCADE NOT NULL,
  value               TEXT                                                 NULL,
  created_at          TIMESTAMP                                            NOT NULL,
  updated_at          TIMESTAMP                                            NOT NULL
);

CREATE TABLE gallery_tag
(
  id         BIGSERIAL PRIMARY KEY,
  gallery_id BIGINT REFERENCES gallery ON DELETE CASCADE NOT NULL,
  tag_id     BIGINT REFERENCES tag ON DELETE CASCADE     NOT NULL,
  created_at TIMESTAMP                                   NOT NULL,
  updated_at TIMESTAMP                                   NOT NULL
);

CREATE TABLE image
(
  id            BIGSERIAL PRIMARY KEY,
  gallery_id    BIGINT REFERENCES gallery NULL,
  thumbnail_url TEXT                      NOT NULL,
  image_url     TEXT                      NOT NULL,
  edit_url      TEXT                      NULL,
  host          image_host                NOT NULL,
  created_at    TIMESTAMP                 NOT NULL,
  updated_at    TIMESTAMP                 NOT NULL
);

CREATE TABLE image_tag
(
  id         BIGSERIAL PRIMARY KEY,
  image_id   BIGINT REFERENCES image ON DELETE CASCADE NOT NULL,
  tag_Id     BIGINT REFERENCES tag ON DELETE CASCADE   NOT NULL,
  created_at TIMESTAMP                                 NOT NULL,
  updated_at TIMESTAMP                                 NOT NULL
);
