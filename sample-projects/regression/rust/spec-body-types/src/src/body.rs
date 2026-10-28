use crate::model::{Dice, Kind, Speed};

pub fn body() -> usize {
    let _dice: Option<Dice> = None;
    let speeds = Vec::<Speed>::new();
    let count = |_kind: &Kind| 1usize;
    speeds.len() + count(&Kind)
}
