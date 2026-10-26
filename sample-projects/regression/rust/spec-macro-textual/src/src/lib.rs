macro_rules! clamp_roll {
    ($roll:expr) => {
        if $roll > 20 { 20 } else { $roll }
    };
}

pub mod fight;
