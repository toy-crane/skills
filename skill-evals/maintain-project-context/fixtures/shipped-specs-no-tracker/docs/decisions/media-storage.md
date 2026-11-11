# Media storage

## Decisions

- Photos and their captions live in the same object store record, so a caption never outlives its photo.

## Why

Separate caption storage left orphan captions after photo deletion in an earlier prototype.

## Reconsider when

- Captions need to be searched across albums.
