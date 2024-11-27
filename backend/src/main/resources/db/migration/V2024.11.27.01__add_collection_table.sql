CREATE TABLE collection
(
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  deleted_at TIMESTAMP    NULL,
  created_at TIMESTAMP    NOT NULL,
  updated_at TIMESTAMP    NOT NULL
);

-- Add default collection for all existing entries
INSERT INTO collection (id, name, created_at, updated_at)
VALUES (1, 'Default', now(), now());

-- Add references to collection
ALTER TABLE image
  ADD collection_id BIGINT REFERENCES collection ON DELETE CASCADE NOT NULL DEFAULT 1;

ALTER TABLE gallery
  ADD collection_id BIGINT REFERENCES collection ON DELETE CASCADE NOT NULL DEFAULT 1;

ALTER TABLE tag
  ADD collection_id BIGINT REFERENCES collection ON DELETE CASCADE NOT NULL DEFAULT 1;

ALTER TABLE gallery_metadata
  ADD collection_id BIGINT REFERENCES collection ON DELETE CASCADE NOT NULL DEFAULT 1;

-- Update uniqueness constraints to incorporate collection
ALTER TABLE tag
  DROP CONSTRAINT tag_unique_name,
  ADD CONSTRAINT tag_unique_name_per_collection UNIQUE (name, collection_id);

ALTER TABLE gallery_metadata
  DROP CONSTRAINT gallery_metadata_unique_name,
  ADD CONSTRAINT gallery_metadata_unique_name_per_collection UNIQUE (name, collection_id);

