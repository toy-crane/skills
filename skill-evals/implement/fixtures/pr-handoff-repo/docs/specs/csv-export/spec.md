# Download the order list as CSV

## Outcome

The order list page has an "Export CSV" link. It downloads every order as a
comma-separated file with a header row.

## Acceptance criteria

1. `GET /export.csv` returns `text/csv` with the header `id,customer,total`
   and one row per order.
2. A customer name containing a comma or a quote is quoted, with quotes
   doubled.
3. The order list page links to `/export.csv` as "Export CSV".

## Setup before implementation

None.

## Post-release check

None.
