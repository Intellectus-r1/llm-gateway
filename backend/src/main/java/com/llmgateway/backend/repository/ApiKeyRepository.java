package com.llmgateway.backend.repository;

import com.llmgateway.backend.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {

    List<ApiKey> findByUserId(Long userId);

    Optional<ApiKey> findByKeyValueAndActiveTrue(String keyValue);
}