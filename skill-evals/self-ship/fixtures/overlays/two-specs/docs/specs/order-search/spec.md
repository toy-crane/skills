# Search the order list by customer

## User-visible outcomes

A search box on the order list page filters orders by customer name.

## Observable acceptance criteria

1. `GET /?q=lee` lists only orders whose customer name contains `lee`,
   ignoring case.
2. An empty query lists every order.

## Setup before implementation

None.

## Post-release check

None.
