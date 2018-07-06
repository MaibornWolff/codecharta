/*
 * From https://github.com/antlr/grammars-v4/blob/master/java/examples/AllInOne7.java
 */

public enum Season {
    WINTER("Cold"), SPRING("Warmer"), SUMMER("Hot"), AUTUMN("Cooler");

    Season(String description) {
        this.description = description;
    }

    private final String description;

    public String getDescription() {
        return description;
    }
}