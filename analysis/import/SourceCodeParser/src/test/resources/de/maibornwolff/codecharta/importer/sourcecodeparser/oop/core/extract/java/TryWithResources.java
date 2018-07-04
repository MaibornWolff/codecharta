class Dummy {
    public static void main(String[] args) {
        try(Database db = new Database()){
            db.doSomething();
        }
    }
}