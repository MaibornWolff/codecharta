class WhenCase {

  data class Scale(val x: Int, val y: Int)

  fun foo(num: Int) {
    when (num) {
      1, 2, 3 -> println(6)
      4 -> println(7)
      5, 6 -> println(8)
      7 -> println(9)
    }
  }
}
