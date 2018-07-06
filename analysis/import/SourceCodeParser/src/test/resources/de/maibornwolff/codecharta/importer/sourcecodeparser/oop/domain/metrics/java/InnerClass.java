/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

// Inner class
class Foo { // Top-level class
    class Bar { // Inner class
    }

    static void inner_class_constructor() {
        // https://docs.oracle.com/javase/specs/jls/se9/html/jls-15.html#jls-15.9
        Foo foo = new Foo();
        Foo.Bar fooBar1 = foo.new Bar();
        Foo.Bar fooBar2 = new Foo().new Bar();
    }
}