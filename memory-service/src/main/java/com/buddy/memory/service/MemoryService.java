package com.buddy.memory.service;

import com.buddy.memory.repository.MessageRepository;
import com.buddy.common.memory.Message;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class MemoryService {
    
    private final MessageRepository messageRepository;
    
    public MemoryService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }
    
    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }
    
    public List<Message> getRecentMessages(String sessionId, int limit) {
        List<Message> allMessages = messageRepository.findBySessionIdOrderByCreatedAtDesc(sessionId);
        if (limit > 0 && limit < allMessages.size()) {
            return allMessages.subList(0, limit);
        }
        return allMessages;
    }
}
