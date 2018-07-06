/*
 * From https://docs.oracle.com/javase/tutorial/java/nutsandbolts/switch.html
 */
public class Foo {

    public static void main(String[] args) {
        java.util.ArrayList<String> futureMonths =
                new java.util.ArrayList<String>();

        int month = 8;
        switch (month) {
            case 1:
                futureMonths.add("January");
            case 2:
                futureMonths.add("February");
                break;
            case 12:
                futureMonths.add("December");
            default:
                break;
        }
    }
}