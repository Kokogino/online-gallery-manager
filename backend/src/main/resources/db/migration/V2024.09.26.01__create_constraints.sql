ALTER TABLE tag
  ADD CONSTRAINT tag_unique_name UNIQUE (name);

ALTER TABLE gallery_metadata
  ADD CONSTRAINT gallery_metadata_unique_name UNIQUE (name);

ALTER TABLE gallery_metadata_entry
  ADD CONSTRAINT gallery_metadata_entry_unique_metadata_per_gallery UNIQUE (gallery_id, gallery_metadata_id);

ALTER TABLE gallery_tag
  ADD CONSTRAINT gallery_tag_unique_tag_per_gallery UNIQUE (gallery_id, tag_id);

ALTER TABLE image_tag
  ADD CONSTRAINT image_tag_unique_tag_per_image UNIQUE (image_id, tag_id);
