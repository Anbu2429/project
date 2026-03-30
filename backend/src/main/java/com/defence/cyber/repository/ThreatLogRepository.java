package com.defence.cyber.repository;

import com.defence.cyber.model.ThreatLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThreatLogRepository extends JpaRepository<ThreatLog, Long> {
}