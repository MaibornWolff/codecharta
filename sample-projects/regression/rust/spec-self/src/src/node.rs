pub struct Node {
    pub next: Option<Box<Node>>,
}

impl Node {
    pub fn new() -> Self {
        Node { next: None }
    }
}
