package com.writespeak.repository;

import com.writespeak.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
    Optional<Progress> findBySessionId(String sessionId);
}
