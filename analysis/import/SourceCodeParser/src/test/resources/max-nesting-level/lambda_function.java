class LambdaFunction {

    public void lamba() {
        FuncInterface fobj = (int x) -> {
            if(a<b) {
                System.out.println(2 * x);
            }
        };

        fobj.abstractFunction(5);
    }
}
