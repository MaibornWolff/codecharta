package none.that.matters

import javax.jws.WebService
import java.time.ZoneId
import java.time.DateTimeException

/*
 * Longer interface comment
 * that goes over multiple lines
 */
@WebService
interface ComplexInterface : Interface1, Interface2, Interface3 {

  // constants
  companion object {
    const val E = 2.718282

    // static methods
    fun getZoneId(zoneString: String): ZoneId {
      return try {
        ZoneId.of(zoneString)
      } catch (e: DateTimeException) {
        System.err.println("Invalid time zone: $zoneString; using default time zone instead.")
        ZoneId.systemDefault()
      }
    }
  }

  // methods
  fun turn(direction: Direction, radius: Double, startSpeed: Double, endSpeed: Double)

  fun changeLanes(direction: Direction, startSpeed: Double, endSpeed: Double): Int

  // default methods
  fun didItWork(i: Int, x: Double, s: String): Boolean {
    return myDeck.sort(Comparator.comparing<Card, Comparable<*>> { it.rank }
      .reversed()
      .thenComparing(Comparator.comparing { it.suit }))
  }

  // enums
  enum class Suit(val value: Int, val text: String) {
    DIAMONDS(1, "Diamonds"),
    CLUBS(2, "Clubs"),
    HEARTS(3, "Hearts"),
    SPADES(4, "Spades");
  }
}
