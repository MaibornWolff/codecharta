/* Sample ABL (OpenEdge) program demonstrating various constructs */

DEFINE VARIABLE customerName AS CHARACTER NO-UNDO.
DEFINE VARIABLE orderTotal AS DECIMAL NO-UNDO INITIAL 0.
DEFINE VARIABLE itemCount AS INTEGER NO-UNDO INITIAL 0.

/* This is a procedure that displays a greeting */
PROCEDURE showGreeting:
    DEFINE INPUT PARAMETER greeting AS CHARACTER NO-UNDO.
    DISPLAY greeting.
END PROCEDURE.

/* Function to calculate discount based on order total */
FUNCTION calculateDiscount RETURNS DECIMAL (INPUT total AS DECIMAL):
    IF total > 100 THEN
        RETURN total * 0.1.
    ELSE IF total > 50 THEN
        RETURN total * 0.05.
    ELSE
        RETURN 0.
END FUNCTION.

/* Function with multiple parameters */
FUNCTION calculateTotal RETURNS DECIMAL (
    INPUT price AS DECIMAL,
    INPUT quantity AS INTEGER,
    INPUT taxRate AS DECIMAL
):
    DEFINE VARIABLE subtotal AS DECIMAL NO-UNDO.
    subtotal = price * quantity.
    RETURN subtotal + (subtotal * taxRate).
END FUNCTION.

/* Main logic */
RUN showGreeting("Welcome to the Order System").

DO itemCount = 1 TO 5:
    orderTotal = orderTotal + calculateTotal(10.00, itemCount, 0.08).
END.

IF orderTotal > 0 THEN DO:
    DEFINE VARIABLE discount AS DECIMAL NO-UNDO.
    discount = calculateDiscount(orderTotal).
    DISPLAY "Order Total: " orderTotal.
    DISPLAY "Discount: " discount.
    DISPLAY "Final: " (orderTotal - discount).
END.
