ALTER TABLE image
  ADD deleted_at TIMESTAMP null;

ALTER TABLE gallery
  ADD deleted_at TIMESTAMP null;

ALTER TABLE tag
  ADD deleted_at TIMESTAMP null;

ALTER TABLE gallery_metadata
  ADD deleted_at TIMESTAMP null;
