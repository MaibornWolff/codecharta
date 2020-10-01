public class Java14 {
    record Scale(int x, int y) { }

    public void foo(int num) {
        switch (num) {
            case 1, 2, 3 -> System.out.println(6);
            case 4 -> System.out.println(7);
            case 5, 6 -> System.out.println(8);
            case 7 -> System.out.println(9);
        }
    }
}