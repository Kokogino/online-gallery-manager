ALTER TABLE image
  DROP CONSTRAINT image_gallery_id_fkey,
  ADD CONSTRAINT image_gallery_id_fkey
    FOREIGN KEY (gallery_id)
      REFERENCES gallery
      ON DELETE SET NULL;
