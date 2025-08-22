package com.buddy.common.memory;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "message")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "session_id", nullable = false)
    private String sessionId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageRole role;
    
    @Column(nullable = false)
    private String content;
    
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    
    public Message() {}
    
    public Message(String sessionId, MessageRole role, String content) {
        this.sessionId = sessionId;
        this.role = role;
        this.content = content;
        this.createdAt = OffsetDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public MessageRole getRole() {
        return role;
    }
    
    public void setRole(MessageRole role) {
        this.role = role;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
