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

## spec-kind-row-type

Types are no declarations, so the type money_amount is not found (decision 5).

```text
missing file app/report.sql -> db/types.sql
missing leaf app/report.sql#report -> db/types.sql#money_amount
```

## spec-object-kinds

Sequences, types and domains are no declarations (decision 5).

```text
missing leaf app/report.sql#cheer -> db/schema.sql#mood
missing leaf app/report.sql#cheer -> db/schema.sql#positive_int
missing leaf app/report.sql#report -> db/schema.sql#order_seq
missing leaf db/schema.sql#orders -> db/schema.sql#mood
missing leaf db/schema.sql#orders -> db/schema.sql#order_seq
missing leaf db/schema.sql#orders -> db/schema.sql#positive_int
```

## spec-object-type

CREATE TYPE … AS OBJECT is no declaration and the type body is no implementation part: the body is a declaration of its
own with its methods as leaves (decisions 5 and 8).

```text
missing file app/shapes.sql -> db/point_t.sql
missing file db/point_t_body.sql -> db/point_t.sql
missing leaf app/shapes.sql#add_shape -> db/point_t.sql#point_t
missing leaf app/shapes.sql#shapes -> db/point_t.sql#point_t
missing leaf db/point_t_body.sql#point_t -> db/point_t.sql#point_t
missing leaf db/point_t_body.sql#point_t -> db/scale.sql#scale
extra leaf db/point_t_body.sql#len -> db/scale.sql#scale
```

## spec-package-member-first

The package body is no implementation part and the members of a specification are no declarations, so a cursor's query
is a use of the package (decisions 1 and 5).

```text
missing file db/pricing.pkb -> db/pricing.pks
missing leaf db/pricing.pkb#helper -> db/pricing.pks#c_max
missing leaf db/pricing.pkb#pricing -> db/pricing.pks#pricing
missing leaf db/pricing.pkb#total -> db/pricing.pks#total
missing leaf db/pricing.pks#c_orders -> db/orders.sql#orders
extra leaf db/pricing.pks#pricing -> db/orders.sql#orders
```

## spec-package-members

The members of a package specification are no declarations, so a cursor's query is a use of the package (decision 5).

```text
missing file app/report.sql -> db/pricing.pks
missing leaf app/report.sql#report -> db/pricing.pks#c_max
missing leaf app/report.sql#report -> db/pricing.pks#c_orders
missing leaf app/report.sql#report -> db/pricing.pks#e_too_big
missing leaf app/report.sql#report -> db/pricing.pks#g_calls
missing leaf app/report.sql#report -> db/pricing.pks#t_rec
missing leaf db/pricing.pks#c_orders -> db/orders.sql#orders
extra leaf db/pricing.pks#pricing -> db/orders.sql#orders
```

## spec-package-private

The routines of a specification are no declarations, so the body's routines are what a caller finds, a private one too
(decision 1).

```text
missing file db/pricing.pkb -> db/pricing.pks
missing leaf db/pricing.pkb#helper -> db/pricing.pks#c_max
missing leaf db/pricing.pkb#pricing -> db/pricing.pks#pricing
missing leaf db/pricing.pkb#total -> db/pricing.pks#total
missing leaf db/pricing.pks#c_orders -> db/orders.sql#orders
extra file app/report.sql -> db/pricing.pkb
extra leaf app/report.sql#report -> db/pricing.pkb#helper
extra leaf db/pricing.pks#pricing -> db/orders.sql#orders
```

## spec-package-spec-body

The routines of a specification are no declarations, so a caller uses the body's routine (decision 1).

```text
missing file app/report.sql -> db/pricing.pks
missing file db/pricing.pkb -> db/pricing.pks
missing leaf app/report.sql#report -> db/pricing.pks#total
missing leaf db/pricing.pkb#helper -> db/pricing.pks#c_max
missing leaf db/pricing.pkb#pricing -> db/pricing.pks#pricing
missing leaf db/pricing.pkb#total -> db/pricing.pks#total
missing leaf db/pricing.pks#c_orders -> db/orders.sql#orders
extra file app/report.sql -> db/pricing.pkb
extra leaf app/report.sql#report -> db/pricing.pkb#total
extra leaf db/pricing.pks#pricing -> db/orders.sql#orders
```

## spec-qualified-package

The members of a package specification are no declarations, so app.pricing.total finds no routine (decision 5).

```text
missing file app/report.sql -> db/pricing.pks
missing leaf app/report.sql#report -> db/pricing.pks#total
```

## spec-sequence-oracle

Sequences are no declarations (decision 5).

```text
missing file app/insert.sql -> db/sequences.sql
missing leaf app/insert.sql#add_order -> db/sequences.sql#order_seq
```

## spec-sequence-tsql

Sequences are no declarations (decision 5).

```text
missing file app/insert.sql -> db/sequences.sql
missing leaf app/insert.sql#add_order -> db/sequences.sql#order_seq
```
