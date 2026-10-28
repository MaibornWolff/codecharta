use std::fmt::Display;

pub struct Arena {
    pub scores: std::collections::HashMap<u8, u8>,
}

pub fn show(value: &dyn Display) -> String {
    value.to_string()
}
