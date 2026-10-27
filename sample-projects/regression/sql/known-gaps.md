# Known gaps: SQL

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/sql.md`. In each block, `missing <line>` is an
expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails once a
gap closes, and the closed lines are deleted here.

## spec-alter-part

An ALTER TABLE or CREATE INDEX of an object another file creates is part of the file's script leaf, not an
implementation part of the object (decision 2).

```text
missing leaf db/V2__foreign_key.sql#orders -> db/V1__orders.sql#customers
missing leaf db/V2__foreign_key.sql#orders -> db/V1__orders.sql#orders
extra leaf db/V2__foreign_key.sql#V2__foreign_key_script -> db/V1__orders.sql#customers
```

## spec-alter-same-file

An ALTER TABLE in the file that creates the table is part of the script leaf, not of the table's leaf (decision 2).

```text
missing leaf db/orders.sql#orders -> db/customers.sql#customers
extra leaf db/orders.sql#orders_script -> db/customers.sql#customers
```

## spec-comment-on

COMMENT ON names no object today (decision 2).

```text
missing file db/V2__comments.sql -> db/V1__orders.sql
missing leaf db/V2__comments.sql#orders -> db/V1__orders.sql#orders
```

## spec-declaration-before-part

An ALTER TABLE is part of the script leaf (decision 2).

```text
missing leaf db/V9__foreign_key.sql#orders -> db/V1__orders.sql#customers
missing leaf db/V9__foreign_key.sql#orders -> db/V1__orders.sql#orders
extra leaf db/V9__foreign_key.sql#V9__foreign_key_script -> db/V1__orders.sql#customers
```
