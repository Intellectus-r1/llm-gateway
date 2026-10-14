
package com.llmgateway.backend.repository;

import com.llmgateway.backend.entity.UsageRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface UsageRecordRepository extends JpaRepository<UsageRecord, Long> {

    List<UsageRecord> findByUserId(Long userId);

    List<UsageRecord> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<UsageRecord> findByUserIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
            Long userId,
            LocalDateTime from,
            LocalDateTime toExclusive
    );
}