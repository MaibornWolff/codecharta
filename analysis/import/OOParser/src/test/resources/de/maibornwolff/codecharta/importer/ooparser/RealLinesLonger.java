package none;

import foo;
import bar;

/*
 * class comment
 */
@Entity
public class Foo {

    private int stuff;

    // constructor, d'uh
    public Foo(){
        stuff = 5; // magic number
    }

    public Blub getStuff(){
        return stuff;
    }

    public void setStuff(int stuff){
        if(stuff < 0){
            reset(5);
        }else{
            this.stuff = stuff;
        }
    }

    private void reset(int num){
        this.stuff = 0;
    }
}