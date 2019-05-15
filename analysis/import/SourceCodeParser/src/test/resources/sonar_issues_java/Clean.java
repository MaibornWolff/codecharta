package sonar_issues_java;

public class Clean {
    int myState;

    public Clean() {
       myState = 0;
    }

    public int sum (int a, int b)
    {
        // sum them
        this.myState += 1;
        return a + b;
    }

    public int getMyState(){
        return this.myState;
    }
}