package com.buddy.memory.repository;

import com.buddy.common.memory.Message;
import com.buddy.common.memory.MessageRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.*;

import java.time.OffsetDateTime;
import java.util.List;

@DataJpaTest
@ActiveProfiles("test")
class MessageRepositoryTest {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Test
    void testSaveAndFindMessage() {
        Message message = new Message("test-session", MessageRole.USER, "Hello Buddy!");
        Message savedMessage = messageRepository.save(message);
        
        assertNotNull(savedMessage.getId());
        assertEquals("test-session", savedMessage.getSessionId());
        assertEquals(MessageRole.USER, savedMessage.getRole());
        assertEquals("Hello Buddy!", savedMessage.getContent());
        assertNotNull(savedMessage.getCreatedAt());
    }
    
    @Test
    void testFindBySessionIdOrderByCreatedAtDesc() {
        // Create messages with different timestamps
        Message message1 = new Message("session-1", MessageRole.USER, "First message");
        Message message2 = new Message("session-1", MessageRole.ASSISTANT, "Second message");
        Message message3 = new Message("session-2", MessageRole.USER, "Other session");
        
        messageRepository.save(message1);
        messageRepository.save(message2);
        messageRepository.save(message3);
        
        List<Message> session1Messages = messageRepository.findBySessionIdOrderByCreatedAtDesc("session-1", 10);
        
        assertEquals(2, session1Messages.size());
        assertEquals("session-1", session1Messages.get(0).getSessionId());
        assertEquals("session-1", session1Messages.get(1).getSessionId());
    }
    
    @Test
    void testMessageRoleEnum() {
        Message userMessage = new Message("test", MessageRole.USER, "User message");
        Message assistantMessage = new Message("test", MessageRole.ASSISTANT, "Assistant message");
        Message toolMessage = new Message("test", MessageRole.TOOL, "Tool message");
        
        messageRepository.save(userMessage);
        messageRepository.save(assistantMessage);
        messageRepository.save(toolMessage);
        
        List<Message> allMessages = messageRepository.findAll();
        assertEquals(3, allMessages.size());
    }
}
