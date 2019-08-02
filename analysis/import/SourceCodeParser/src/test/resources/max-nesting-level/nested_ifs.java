public class Foo {
    public void setStuff(int stuff){
        this.wasReset = false;
        if(stuff < 0){
            reset(5);
            wasReset = true;
        } else if(reset(-1)){
            this.stuff = stuff;
        }

        if(0 < 1) {
            if(1 < 0) {
                System.out.println("ABC");
            }
        }
        System.out.println("SetStuff was called");
    }
}
