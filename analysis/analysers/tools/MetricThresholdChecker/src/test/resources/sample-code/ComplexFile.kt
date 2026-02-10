package sample

class ComplexFile {
    fun complexFunction(x: Int): Int {
        if (x > 10) {
            if (x > 20) {
                if (x > 30) {
                    return x * 2
                } else {
                    return x + 10
                }
            } else {
                return x + 5
            }
        } else {
            return x
        }
    }

    fun anotherFunction(a: Int, b: Int): Int {
        val result = a + b
        return when {
            result > 100 -> result * 2
            result > 50 -> result + 10
            else -> result
        }
    }
}
