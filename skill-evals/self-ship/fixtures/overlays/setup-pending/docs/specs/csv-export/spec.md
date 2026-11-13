# Download the order list as CSV

## User-visible outcomes

The order list page has an "Export CSV" link. It downloads every order as a
comma-separated file with a header row.

## Approved scope

- A `GET /export.csv` route and a link to it on the order list page.
- A nightly copy of the same file uploaded to the `orders-exports` bucket.

## Observable acceptance criteria

1. `GET /export.csv` returns `text/csv` with the header `id,customer,total`
   and one row per order.
2. A customer name containing a comma or a quote is quoted, with quotes
   doubled.
3. The order list page links to `/export.csv` as "Export CSV".

## Settled constraints and rationale

- No CSV library: the format needs only quoting, and the project has no
  dependencies.

## Assumptions

- The order list page is rendered in `src/views/list.js`.

## Off-limits

- Changing how orders are stored.

## Deferred points

None.

## Remaining risks

None.

## Setup before implementation

- Object storage bucket `orders-exports` created in the team's cloud account
  (nightly export copy): the bucket appears in the storage console.
- Storage write key (nightly export copy): placed in `.env` as
  `EXPORT_BUCKET_KEY`; a test upload with it succeeds.

## Post-release check

None.
