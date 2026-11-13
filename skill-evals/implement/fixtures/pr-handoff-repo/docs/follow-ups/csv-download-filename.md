# The CSV download has a fixed filename

Found by the whole-diff review of docs/specs/csv-export/. Out of scope for that
spec, which says nothing about the filename.

- Symptom: every download is saved as `orders.csv`, so a second download in
  the same folder becomes `orders (1).csv`.
- Evidence: `src/server.js` sets `content-disposition: attachment; filename="orders.csv"`.
- Suspected cause: the filename carries no date.
- Tried: nothing; left as is.
- Next step: decide whether the filename should carry the export date.
