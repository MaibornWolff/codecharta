CREATE TABLE items (id bigint PRIMARY KEY);
CREATE TABLE item_versions (id bigint PRIMARY KEY, item_id bigint REFERENCES items (id));
