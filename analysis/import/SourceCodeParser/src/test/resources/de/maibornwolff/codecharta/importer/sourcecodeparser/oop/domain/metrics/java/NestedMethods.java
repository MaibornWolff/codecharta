/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

public class None {

    public void nestingSimpleThree(int stuff) {
        if (stuff > 0) {
            if (stuff > 1) {
                if (stuff > 2) {
                    System.out.println("SetStuff was called");
                }
            }
        }else{
            System.out.println("Too little nesting");
        }
    }

}