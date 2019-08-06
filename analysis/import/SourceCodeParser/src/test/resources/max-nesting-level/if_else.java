public class Foo {

    public void setStuff(int stuff){
        this.wasReset = false;
        if(stuff < 0){
            reset(5);
            wasReset = true;
        } else {
            this.stuff = stuff;
        }
        System.out.println("SetStuff was called");
    }
}
