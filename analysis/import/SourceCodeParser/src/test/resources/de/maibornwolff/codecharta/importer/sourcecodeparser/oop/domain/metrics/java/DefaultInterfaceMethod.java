/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne8.java
 */

// Default interface method
interface Formula {
    double calculate(int a);

    default double sqrt(int a) {
        return Math.sqrt(a);
    }
}