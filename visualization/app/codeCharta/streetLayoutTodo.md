## refactoring

- refactoring of algorithm needs more work, maybe abstract the layout Generator for both street and squared layout.
- needs more unit tests.
- refactore horizontalStreet.ts (layoutTopRow, layoutBottomRow are very similar)

## bugs

- height is not calculated properly.
- manual margin is not working.

## improvement

- scaling is not same in both algorithm.
- no label on streets.
- autocentering the camera does not always fit the label, the bounding box should include the labels.
