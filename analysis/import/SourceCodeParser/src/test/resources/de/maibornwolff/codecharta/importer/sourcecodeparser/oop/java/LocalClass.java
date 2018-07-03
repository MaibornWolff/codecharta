/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

// Local class
class Foo {
    void bar() {
        @WeakOuter
        class Foobar {// Local class within a method
        }
    }
}