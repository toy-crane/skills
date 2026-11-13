# Customer data

Settled 2026-11-10, after the CSV export spec was written.

## Decisions

- Customer email addresses never leave the support tool. No page, export,
  or report in `orders` shows or downloads them. Support looks customers up
  by order id instead.

## Why

A downloaded file with emails was forwarded outside the company in October.
