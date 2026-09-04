package de.sots.cellarsandcentaurs.adapter.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CreatureJpaRepository extends JpaRepository<CreatureEntity, UUID> {
}
