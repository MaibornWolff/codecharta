/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

public class HelloWorld {
    public static void main(String[] args) {
        /* The following line is equivalent to:
           System.out.println("Hello World!");
           and would have been incorrect without the import declaration. */
        out.println("Hello World!");

        // Conditional statements -------------------
        if (i == 3) doSomething();

        if (i == 2) {
            doSomething();
        } else {
            doSomethingElse();
        }

        if (i == 3) {
            doSomething();
        } else if (i == 2) {
            doSomethingElse();
        } else {
            doSomethingDifferent();
        }

        int a = 1;
        int b = 2;
        int minVal = (a < b) ? a : b;

        // switch
        switch (ch) {
            case 'A':
                doSomething(); // Triggered if ch == 'A'
                break;
            case 'B':
            case 'C':
                doSomethingElse(); // Triggered if ch == 'B' or ch == 'C'
                break;
            default:
                doSomethingDifferent(); // Triggered in any other case
                break;
        }

        // Iteration statements -------------------
        while (i < 10) {
            doSomething();
        }

        do {
            doSomething();
        } while (i < 10);

        for (int i = 0; i < 10; i++) {
            doSomething();
        }

        // A more complex loop using two variables
        for (int i = 0, j = 9; i < 10; i++, j -= 3) {
            doSomething();
        }

        for (;;) {
            doSomething();
        }

        for (int i : intArray) {
            doSomething(i);
        }

        // Jump statements -------------------
        // Label
        start:
        someMethod();

        // break
        for (int i = 0; i < 10; i++) {
            while (true) {
                break;
            }
            // Will break to this point
        }

        outer:
        for (int i = 0; i < 10; i++) {
            while (true) {
                break outer;
            }
        }
        // Will break to this point

        // continue
        int ch;
        while (ch = getChar()) {
            if (ch == ' ') {
                continue; // Skips the rest of the while-loop
            }

            // Rest of the while-loop, will not be reached if ch == ' '
            doSomething();
        }

        outer:
        for (String str : stringsArr) {
            char[] strChars = str.toCharArray();
            for (char ch : strChars) {
                if (ch == ' ') {
                    /* Continues the outer cycle and the next
                    string is retrieved from stringsArr */
                    continue outer;
                }
                doSomething(ch);
            }
        }

        // return
        // If streamClosed is true, execution is stopped
        if (streamClosed) {
            return;
        }
        readFromStream();

        int result = a + b;
        return result;

        // Exception handling statements -------------------
        // try-catch-finally
        try {
            // Statements that may throw exceptions
            methodThrowingExceptions();
        } catch (Exception ex) {
            // Exception caught and handled here
            reportException(ex);
        } finally {
            // Statements always executed after the try/catch blocks
            freeResources();
        }

        try {
            methodThrowingExceptions();
        } catch (IOException | IllegalArgumentException ex) {
            //Both IOException and IllegalArgumentException will be caught and handled here
            reportException(ex);
        }

        // try-with-resources statement
        try (FileOutputStream fos = new FileOutputStream("filename");
             XMLEncoder xEnc = new XMLEncoder(fos))
        {
            xEnc.writeObject(object);
        } catch (IOException ex) {
            Logger.getLogger(Serializer.class.getName()).log(Level.SEVERE, null, ex);
        }

        // throw
        if (obj == null) {
            // Throws exception of NullPointerException type
            throw new NullPointerException();
        }
        // Will not be called, if object is null
        doSomethingWithObject(obj);

        // Thread concurrency control -------------------
        /* Acquires lock on someObject. It must be of a reference type and must be non-null */
        synchronized (someObject) {
            // Synchronized statements
        }

        // assert statement
        // If n equals 0, AssertionError is thrown
        assert n != 0;
        /* If n equals 0, AssertionError will be thrown
        with the message after the colon */
        assert n != 0 : "n was equal to zero";

        // Reference types -------------------
        // Arrays
        int[] numbers = new int[5];
        numbers[0] = 2;
        int x = numbers[0];

        // Initializers -------------------
        // Long syntax
        int[] numbers = new int[] {20, 1, 42, 15, 34};
        // Short syntax
        int[] numbers2 = {20, 1, 42, 15, 34};

        // Multi-dimensional arrays
        int[][] numbers = new int[3][3];
        numbers[1][2] = 2;
        int[][] numbers2 = {{2, 3, 2}, {1, 2, 6}, {2, 4, 5}};

        int[][] numbers = new int[2][]; //Initialization of the first dimension only
        numbers[0] = new int[3];
        numbers[1] = new int[2];

        // Prefix & postfix
        numbers[0][0]++;
        numbers[0][0]--;
        ++numbers[0][0];
        --numbers[0][0];
        foo()[0]++;
        foo()[0]--;
        ++foo()[0];
        --foo()[0];
    }
}