-- PostgreSQL
-- Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
CREATE TABLE "Zentaurenhöhle" (
    höhle_id SERIAL PRIMARY KEY,
    "rüstungsklasse" INT NOT NULL,
    beschreibung TEXT DEFAULT 'Größe der Höhle'
);
