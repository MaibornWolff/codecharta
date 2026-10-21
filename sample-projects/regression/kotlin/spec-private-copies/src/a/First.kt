package a

private class Helper {
    class Inner
}

class First {
    val helper: Helper? = null
    val inner: Helper.Inner? = null
}
