/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

// Constructors and initializers
class Foo {

    private static final String hello;

    String str;

    Foo() { // Constructor with no arguments
        // Initialization
    }

    Foo(String str) { // Constructor with one argument
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