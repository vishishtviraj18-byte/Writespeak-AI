package com.writespeak.repository;

import com.writespeak.model.Progress;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ProgressRepository extends MongoRepository<Progress, String> {
    Optional<Progress> findByUsername(String username);
}
