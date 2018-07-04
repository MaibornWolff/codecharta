/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

public enum Season {
    WINTER {
        String getDescription() {return "cold";}
    },
    SPRING {
        String getDescription() {return "warmer";}
    },
    SUMMER {
        String getDescription() {return "hot";}
    },
    FALL {
        String getDescription() {return "cooler";}
    };
}