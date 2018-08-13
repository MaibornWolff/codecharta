package de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application._java.parsing

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.OverviewMetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.DetailedSourceProviderStub
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.calculateDetailedMetricsWithFailOnParseError
import de.maibornwolff.codecharta.importer.sourcecodeparser.test_helpers.defaultJavaSource
import org.junit.Test

class ComplexInterfaceTest {

    @Test
    fun `example has correct rloc count`() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.RLoc] }.isEqualTo(44)
    }

    @Test
    fun `example has complexity of `() {
        val locationResolverStub = DetailedSourceProviderStub(defaultJavaSource(code))

        val singleMetrics = calculateDetailedMetricsWithFailOnParseError(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[OverviewMetricType.MCC] }.isEqualTo(7)
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
}
""".trim().lines()
}