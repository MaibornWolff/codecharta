use crate::creature::Creature;

pub fn fight(boss: &Creature) -> u8 {
    boss.attack() + boss.speed
}
