/* A comprehensive sample program demonstrating various ABL features.
   Used for golden file contract testing. */

// Constants
DEFINE VARIABLE MAX_RETRIES AS INTEGER INITIAL 3 NO-UNDO.
DEFINE VARIABLE PREFIX AS CHARACTER INITIAL "Hello, " NO-UNDO.

// Status values
DEFINE VARIABLE STATUS_PENDING AS CHARACTER INITIAL "pending" NO-UNDO.
DEFINE VARIABLE STATUS_ACTIVE AS CHARACTER INITIAL "active" NO-UNDO.
DEFINE VARIABLE STATUS_COMPLETED AS CHARACTER INITIAL "completed" NO-UNDO.

/* Simple procedure with no complexity */
PROCEDURE getCounter:
    DEFINE OUTPUT PARAMETER pCounter AS INTEGER NO-UNDO.
    pCounter = 0.
END PROCEDURE.

/* Calculate sum with validation and control flow */
FUNCTION calculateSum RETURNS INTEGER (
    INPUT piA AS INTEGER,
    INPUT piB AS INTEGER,
    INPUT piC AS INTEGER
):
    DEFINE VARIABLE iSum AS INTEGER NO-UNDO.
    DEFINE VARIABLE i AS INTEGER NO-UNDO.

    IF piA < 0 OR piB < 0 THEN
        RETURN 0.

    DO i = 1 TO piC:
        iSum = iSum + piA + piB.
    END.

    RETURN iSum.
END FUNCTION.

/* A procedure that processes data with nested logic */
PROCEDURE processData:
    DEFINE INPUT PARAMETER pcInput AS CHARACTER NO-UNDO.
    DEFINE OUTPUT PARAMETER pcResult AS CHARACTER NO-UNDO.

    DEFINE VARIABLE cTemp AS CHARACTER NO-UNDO.
    DEFINE VARIABLE i AS INTEGER NO-UNDO.

    IF pcInput = "" THEN DO:
        pcResult = "empty".
        RETURN.
    END.

    IF LENGTH(pcInput) > 10 THEN DO:
        REPEAT i = 1 TO 3:
            cTemp = cTemp + SUBSTRING(pcInput, 1, 5).
        END.
        pcResult = cTemp.
    END.
    ELSE DO:
        pcResult = pcInput.
    END.
END PROCEDURE.

/* Demonstrates case statement usage */
PROCEDURE formatByType:
    DEFINE INPUT PARAMETER piType AS INTEGER NO-UNDO.
    DEFINE OUTPUT PARAMETER pcLabel AS CHARACTER NO-UNDO.

    CASE piType:
        WHEN 1 THEN pcLabel = "one".
        WHEN 2 THEN pcLabel = "two".
        WHEN 3 THEN pcLabel = "three".
        OTHERWISE pcLabel = "unknown".
    END CASE.

    pcLabel = PREFIX + pcLabel.
END PROCEDURE.

/* Greet function example */
FUNCTION greet RETURNS CHARACTER (
    INPUT pcName AS CHARACTER
):
    RETURN "Hello, " + pcName + "!".
END FUNCTION.

/* FOR EACH example with database access pattern */
PROCEDURE processRecords:
    DEFINE VARIABLE cResult AS CHARACTER NO-UNDO.

    FOR EACH Customer NO-LOCK:
        IF Customer.Status = STATUS_ACTIVE THEN
            cResult = cResult + Customer.Name + ",".
    END.
END PROCEDURE.

/* Enum definition example */
ENUM OrderStatus:
    DEFINE ENUM Pending.
    DEFINE ENUM Processing.
    DEFINE ENUM Shipped.
    DEFINE ENUM Delivered.
END ENUM.

/* Class with properties, methods, and constructor */
CLASS OrderProcessor:
    DEFINE PUBLIC PROPERTY OrderId AS INTEGER NO-UNDO
        GET.
        SET.

    DEFINE PUBLIC PROPERTY CustomerName AS CHARACTER NO-UNDO
        GET.
        SET.

    CONSTRUCTOR PUBLIC OrderProcessor(piOrderId AS INTEGER):
        OrderId = piOrderId.
    END CONSTRUCTOR.

    METHOD PUBLIC VOID ProcessOrder(pcStatus AS CHARACTER):
        IF pcStatus = "rush" THEN
            OrderId:ToString().
    END METHOD.

    METHOD PUBLIC CHARACTER GetSummary():
        RETURN CustomerName + ": Order " + STRING(OrderId).
    END METHOD.
END CLASS.

/* Buffer and temp-table definitions */
DEFINE BUFFER bufCustomer FOR Customer.
DEFINE TEMP-TABLE ttOrder NO-UNDO
    FIELD OrderNum AS INTEGER
    FIELD Amount AS DECIMAL.
DEFINE DATASET dsOrders FOR ttOrder.

/* Exception handling example */
PROCEDURE safeOperation:
    DEFINE VARIABLE oError AS Progress.Lang.Error NO-UNDO.

    DO ON ERROR UNDO, THROW:
        RUN riskyProcedure.
        CATCH err AS Progress.Lang.Error:
            oError = err.
            MESSAGE oError:GetMessage(1).
        END CATCH.
    END.
END PROCEDURE.

/* Message chain example */
PROCEDURE chainExample:
    DEFINE VARIABLE oProcessor AS OrderProcessor NO-UNDO.
    oProcessor = NEW OrderProcessor(100).
    oProcessor:ProcessOrder("rush").
    oProcessor:GetSummary().
END PROCEDURE.
