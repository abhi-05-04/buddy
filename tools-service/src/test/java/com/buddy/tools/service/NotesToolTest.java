package com.buddy.tools.service;

import com.buddy.common.tool.ToolResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class NotesToolTest {
    
    private NotesTool notesTool;
    
    @BeforeEach
    void setUp() {
        notesTool = new NotesTool();
    }
    
    @Test
    void testSaveNote() {
        ToolResult result = notesTool.execute("save: Test Note This is a test note content");
        
        assertTrue(result.isSuccess());
        assertEquals("Note saved successfully: Test Note", result.getResult());
    }
    
    @Test
    void testGetNote() {
        // First save a note
        notesTool.execute("save: Test Note This is a test note content");
        
        // Then retrieve it
        ToolResult result = notesTool.execute("get: Test Note");
        
        assertTrue(result.isSuccess());
        assertTrue(result.getResult().contains("Test Note"));
        assertTrue(result.getResult().contains("This is a test note content"));
    }
    
    @Test
    void testListNotes() {
        // Save some notes
        notesTool.execute("save: Note 1 Content 1");
        notesTool.execute("save: Note 2 Content 2");
        
        ToolResult result = notesTool.execute("list");
        
        assertTrue(result.isSuccess());
        assertTrue(result.getResult().contains("Note 1"));
        assertTrue(result.getResult().contains("Note 2"));
    }
    
    @Test
    void testGetNonExistentNote() {
        ToolResult result = notesTool.execute("get: NonExistent");
        
        assertFalse(result.isSuccess());
        assertTrue(result.getError().contains("Note not found"));
    }
    
    @Test
    void testEmptyInput() {
        ToolResult result = notesTool.execute("");
        
        assertFalse(result.isSuccess());
        assertTrue(result.getError().contains("Input cannot be empty"));
    }
    
    @Test
    void testInvalidSaveFormat() {
        ToolResult result = notesTool.execute("save: OnlyTitle");
        
        assertFalse(result.isSuccess());
        assertTrue(result.getError().contains("Both title and content are required"));
    }
    
    @Test
    void testInvalidCommand() {
        ToolResult result = notesTool.execute("invalid command");
        
        assertFalse(result.isSuccess());
        assertTrue(result.getError().contains("Invalid input format"));
    }
}
