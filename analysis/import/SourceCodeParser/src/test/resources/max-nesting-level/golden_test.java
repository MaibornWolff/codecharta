import java.awt.*;

class GoldenTest {

    public void goldenTest() {
        if (1 < 2) {
            for (i = 0; i < 2; i++) {
                System.out.println("ABC");
                System.out.println("ABC");
                if (1 < 2) {
                    System.out.println("ABC");
                } else if (1 < 2) {
                    System.out.println("ABC");
                    for (i = 0; i < 2; i++) {
                        if (1 < 2) {
                            System.out.println("ABC");
                            if (2 < 3) {
                                System.out.println("ABC");
                            }
                        } else if (1 < 2) {
                            System.out.println("ABC");
                        }
                    }
                }
            }
        } else {
            if (1 < 2) {
                System.out.println("ABC");
            }
        }
    }
}
