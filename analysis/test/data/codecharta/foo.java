package none;

import foo;
import bar;

/*
 * class comment
 */
@Entity
public class Foo {

    @Deprecated("this is bad code")
    private int stuff;

    private volatile boolean wasReset = false;

    // constructor, d'uh
    public Foo() {
        stuff = 5; // magic number
    }

    public Blub getStuff() {
        int i = stuff - 1;
        i++;
        i = i + 0;
        return i;
    }

    public void setStuff(int stuff) {
        this.wasReset = false;
        if (stuff < 0) {
            reset(5);
            wasReset = true;
        } else if (reset(-1)) {
            this.stuff = stuff;
        }
        System.out.println("SetStuff was called");
    }

    private void reset(int num) {
        this.stuff = 0;
    }
}