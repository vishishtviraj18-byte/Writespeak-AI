package com.writespeak.repository;

import com.writespeak.model.TestResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TestResultRepository extends MongoRepository<TestResult, String> {
    List<TestResult> findByUsernameOrderByDateDesc(String username);
}
