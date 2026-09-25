pub mod den;

use crate::domain::model::lair::den::Den;

#[derive(Debug, Clone)]
pub struct Lair {
    den: Den,
    treasure: u32,
}

impl Lair {
    pub fn new(depth: u32, treasure: u32) -> Self {
        Lair {
            den: Den { depth },
            treasure,
        }
    }

    pub fn depth(&self) -> u32 {
        self.den.depth
    }

    pub fn treasure(&self) -> u32 {
        self.treasure
    }
}
