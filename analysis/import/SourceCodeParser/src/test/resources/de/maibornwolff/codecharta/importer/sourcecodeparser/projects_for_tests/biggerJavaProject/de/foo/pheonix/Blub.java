/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

// Constructors and initializers
class Blub {

    private static final String hello;

    String str;

    Blub() { // Constructor with no arguments
        // Initialization
    }

    Blub(String str) { // Constructor with one argument
        this.str = str;
    }

    static {
        System.out.println(AbstractClass.class.getName() + ": static block runtime");
        hello = "hello from " + AbstractClass.class.getName();
    }

    {
        System.out.println(AbstractClass.class.getName() + ": instance block runtime");
    }
}