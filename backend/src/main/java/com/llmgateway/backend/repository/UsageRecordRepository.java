
package com.llmgateway.backend.repository;

import com.llmgateway.backend.entity.UsageRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
    SELECT COALESCE(SUM(u.inputTokens), 0),
           COALESCE(SUM(u.outputTokens), 0),
           COALESCE(SUM(u.totalTokens), 0),
           COALESCE(SUM(u.estimatedCost), 0.0),
           COUNT(u)
    FROM UsageRecord u
    WHERE u.user.id = :userId
    """)
    Object[] summarizeUsageByUserId(@Param("userId") Long userId);

    @Query("""
    SELECT u.provider,
           COUNT(u),
           COALESCE(SUM(u.inputTokens), 0),
           COALESCE(SUM(u.outputTokens), 0),
           COALESCE(SUM(u.totalTokens), 0),
           COALESCE(SUM(u.estimatedCost), 0.0)
    FROM UsageRecord u
    WHERE u.user.id = :userId
    GROUP BY u.provider
    """)
    List<Object[]> summarizeUsageByProvider(@Param("userId") Long userId);
}