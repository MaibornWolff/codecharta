package zoo

@Shift(8)
@Night
class Watch {
    fun start() {
        Keeper()
    }

    class Round {
        val keeper: Keeper? = null
    }
}
