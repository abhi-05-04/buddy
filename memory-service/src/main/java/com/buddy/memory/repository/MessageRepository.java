package com.buddy.memory.repository;

import com.buddy.common.memory.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE m.sessionId = :sessionId ORDER BY m.createdAt DESC")
    List<Message> findBySessionIdOrderByCreatedAtDesc(@Param("sessionId") String sessionId);
}
