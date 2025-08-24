package com.buddy.tools.service;

import com.buddy.common.tool.Tool;
import com.buddy.common.tool.ToolResult;
import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Component
public class NotesTool implements Tool {
    
    private final Map<String, NoteData> notes = new ConcurrentHashMap<>();
    
    private static class NoteData {
        private final String title;
        private final String content;
        private final long createdAt;
        private final long updatedAt;
        
        public NoteData(String title, String content) {
            this.title = title;
            this.content = content;
            this.createdAt = System.currentTimeMillis();
            this.updatedAt = System.currentTimeMillis();
        }
        
        public String getTitle() { return title; }
        public String getContent() { return content; }
        public long getCreatedAt() { return createdAt; }
        public long getUpdatedAt() { return updatedAt; }
    }
    
    @Override
    public String getName() {
        return "notes";
    }
    
    @Override
    public String getDescription() {
        return "Store and retrieve notes. Use 'save: <title>' to save a note, 'get: <title>' to retrieve, or 'list' to see all notes.";
    }
    
    @Override
    public String getInputSchema() {
        return "String input: 'save: <title> <content>' or 'get: <title>' or 'list'";
    }
    
    @Override
    public ToolResult execute(String input) {
        if (input == null || input.trim().isEmpty()) {
            return ToolResult.failure("Input cannot be empty");
        }
        
        String trimmedInput = input.trim();
        
        if (trimmedInput.equalsIgnoreCase("list")) {
            return listNotes();
        } else if (trimmedInput.startsWith("get:")) {
            return getNote(trimmedInput.substring(4).trim());
        } else if (trimmedInput.startsWith("save:")) {
            return saveNote(trimmedInput.substring(5).trim());
        } else {
            return ToolResult.failure("Invalid input format. Use 'save: <title> <content>', 'get: <title>', or 'list'");
        }
    }
    
    private ToolResult listNotes() {
        if (notes.isEmpty()) {
            return ToolResult.success("No notes found.");
        }
        
        StringBuilder result = new StringBuilder("Available notes:\n");
        notes.forEach((title, noteData) -> 
            result.append("- ").append(title).append(" (created: ").append(new java.util.Date(noteData.getCreatedAt())).append(")\n")
        );
        return ToolResult.success(result.toString());
    }
    
    private ToolResult getNote(String title) {
        if (title.isEmpty()) {
            return ToolResult.failure("Note title cannot be empty");
        }
        
        NoteData noteData = notes.get(title);
        if (noteData == null) {
            return ToolResult.failure("Note not found: " + title);
        }
        
        return ToolResult.success("Note: " + title + "\n" + noteData.getContent());
    }
    
    private ToolResult saveNote(String input) {
        int firstSpace = input.indexOf(' ');
        if (firstSpace == -1) {
            return ToolResult.failure("Please provide both title and content. Format: 'save: <title> <content>'");
        }
        
        String title = input.substring(0, firstSpace).trim();
        String content = input.substring(firstSpace + 1).trim();
        
        if (title.isEmpty() || content.isEmpty()) {
            return ToolResult.failure("Both title and content are required");
        }
        
        notes.put(title, new NoteData(title, content));
        return ToolResult.success("Note saved successfully: " + title);
    }
}
