use crate::model::{roll_d20, Creature, MAX};

pub fn check() -> usize {
    let herd = vec![Creature::new()];
    assert_eq!(roll_d20(), MAX);
    println!("{}", herd.len());
    herd.len()
}
