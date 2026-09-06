use std::collections::HashMap;

pub trait Identified {
    fn key(&self) -> String;
}

pub struct Repository<T: Identified> {
    items: HashMap<String, T>,
}

impl<T: Identified> Repository<T> {
    pub fn new() -> Self {
        Repository { items: HashMap::new() }
    }

    pub fn save(&mut self, item: T) {
        self.items.insert(item.key(), item);
    }

    pub fn find_one(&self, key: &str) -> Option<&T> {
        self.items.get(key)
    }

    pub fn find_all(&self) -> Vec<&T> {
        self.items.values().collect()
    }
}
