package a

private class Helper {
    class Inner
}

class Second {
    val helper: Helper? = null
    val inner: Helper.Inner? = null
}
