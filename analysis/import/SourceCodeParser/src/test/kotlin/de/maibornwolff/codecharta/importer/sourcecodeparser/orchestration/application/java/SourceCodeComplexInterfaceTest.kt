package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.java

import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.javaSource
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.CodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging.NonCodeTags
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.calculateDetailedMetrics
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class SourceCodeComplexInterfaceTest {

    @Test
    fun finds_all_lines() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.rowCount()).isEqualTo(66)
    }

    @Test
    fun finds_all_comments() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(NonCodeTags.COMMENT)).containsExactly(8, 9, 10, 11, 16, 19, 39, 48, 59)
    }

    @Test
    fun finds_imports() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.IMPORT)).containsExactly(4, 6)
    }

    @Test
    fun finds_interface() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.INTERFACE)).containsExactly(13)
    }

    @Test
    fun finds_constant_declarations() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.INTERFACE_CONSTANT)).containsExactly(17)
    }

    @Test
    fun finds_enumConstant() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.ENUM_CONSTANT)).containsExactly(21, 22, 23, 24)
    }

    @Test
    fun finds_fields_in_enum() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.CLASS_FIELD)).containsExactly(26, 27)
    }

    @Test
    fun finds_methods() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.METHOD)).containsExactly(34, 36, 40, 44, 49, 60)
    }

    @Test
    fun finds_constructor() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.CONSTRUCTOR)).containsExactly(29)
    }

    @Test
    fun finds_method_calls() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.METHOD_CALL)).containsExactly(51, 53, 55, 61, 62, 63, 64)
    }

    @Test
    fun finds_statements() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.STATEMENT))
                .containsExactly(30, 31, 34, 36, 50, 51, 53, 55, 61)
    }

    @Test
    fun finds_expressions() {
        val sourceCode = javaSource("Foo.java", "", code)
        val locationResolverStub = DetailedSourceProviderStub(sourceCode)

        val detailedMetricTable = calculateDetailedMetrics(locationResolverStub)

        assertThat(detailedMetricTable.linesWithTag(CodeTags.EXPRESSION))
                .containsExactly(17, 21, 22, 23, 24, 30, 31, 34, 36, 51, 53, 54, 55, 61, 62, 64)
    }

    private val code =
"""
package none.that.matters;

import foo;

import javax.jws.WebService;import static blub.sponge;

/*
 * Longer interface comment
 * that goes over multiple lines
 */
@WebService
public interface SourceCodeComplexInterface
        extends Interface1, Interface2, Interface3 {

    // constants
    double E = 2.718282;

    // enums
    public enum Suit {
        DIAMONDS (1, "Diamonds"),
        CLUBS    (2, "Clubs"   ),
        HEARTS   (3, "Hearts"  ),
        SPADES   (4, "Spades"  );

        private final int value;
        private final String text;

        Suit(int value, String text) {
            this.value = value;
            this.text = text;
        }

        public int value() {return value;}

        public String text() {return text;}
    }

    // methods
    void turn(Direction direction,
              double radius,
              double startSpeed,
              double endSpeed);
    int changeLanes(Direction direction,
                    double startSpeed,
                    double endSpeed);

    // static methods
    static ZoneId getZoneId (String zoneString) {
        try {
            return ZoneId.of(zoneString);
        } catch (DateTimeException e) {
            System.err.println("Invalid time zone: " + zoneString +
                    "; using default time zone instead.");
            return ZoneId.systemDefault();
        }
    }

    // default methods
    default boolean didItWork(int i, double x, String s) {
        return myDeck.sort(
                Comparator.comparing(Card::getRank)
                        .reversed()
                        .thenComparing(Comparator.comparing(Card::getSuit)));
    }
}""".lines()

}