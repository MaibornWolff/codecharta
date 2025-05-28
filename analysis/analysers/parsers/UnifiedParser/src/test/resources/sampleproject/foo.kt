package none

/*
 * class comment
 */
@Entity
class Foo {

  @Deprecated("this is bad code")
  private var stuff: Int = 0

  private @Volatile var wasReset: Boolean = false

  // constructor, d'uh
  init {
    stuff = 5 // magic number
  }

  fun getStuff(): Int {
    var i = stuff - 1
    i++
    i = i + 0
    return i
  }

  fun setStuff(stuff: Int) {
    this.wasReset = false
    if (stuff < 0) {
      reset(5)
      wasReset = true
    } else if (reset(-1)) {
      this.stuff = stuff
    }
    println("SetStuff was called")
  }

  private fun reset(num: Int): Boolean {
    this.stuff = 0
    return true // Added return statement to match the conditional usage in setStuff
  }
}
