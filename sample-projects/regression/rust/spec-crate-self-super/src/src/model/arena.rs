pub mod inner {
    pub struct Deep;
}

pub struct Arena {
    pub boss: crate::model::Creature,
    pub pace: super::speed::Speed,
    pub deep: self::inner::Deep,
}
