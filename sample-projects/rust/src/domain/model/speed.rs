#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Speed {
    speed: u32,
}

impl Speed {
    pub fn new(speed: u32) -> Self {
        Speed { speed }
    }

    pub fn speed(&self) -> u32 {
        self.speed
    }

    pub fn set_speed(&mut self, speed: u32) {
        self.speed = speed;
    }
}
