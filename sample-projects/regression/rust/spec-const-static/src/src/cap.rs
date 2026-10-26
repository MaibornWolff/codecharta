use crate::limits::{MAX, NAME};

pub fn cap() -> (u8, &'static str) {
    (MAX, NAME)
}
