use crate::domain::model::armor_class::ArmorClass;

// Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
pub struct Zentaurenhöhle {
    rüstungsklasse: ArmorClass,
}

impl Zentaurenhöhle {
    pub fn label(&self) -> &'static str {
        "Größe der Höhle"
    }
}
