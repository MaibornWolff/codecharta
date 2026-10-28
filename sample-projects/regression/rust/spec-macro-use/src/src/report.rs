use crate::macros::creature_count;

pub fn count(herd: Vec<u8>) -> usize {
    creature_count!(herd)
}
