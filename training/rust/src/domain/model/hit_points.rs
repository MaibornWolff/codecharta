pub const MAX_HIT_POINTS: u32 = 999;

/// Hit points drop when the creature takes damage and recover when it rests in its lair.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct HitPoints {
    pub current: u32,
    pub max: u32,
    pub temporary: u32,
}

impl HitPoints {
    pub fn new(current: u32, max: u32, temporary: u32) -> Self {
        HitPoints {
            current,
            max: max.min(MAX_HIT_POINTS),
            temporary,
        }
    }

    pub fn init(max: u32) -> Self {
        Self::new(max, max, 0)
    }

    pub fn take_damage(&mut self, damage: u32) {
        self.current = self.current.saturating_sub(damage);
    }
}
