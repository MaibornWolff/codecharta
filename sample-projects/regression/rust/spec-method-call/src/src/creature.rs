pub struct Creature {
    pub speed: u8,
}

impl Creature {
    pub fn attack(&self) -> u8 {
        self.speed
    }
}
