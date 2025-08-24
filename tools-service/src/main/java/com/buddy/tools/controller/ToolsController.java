package com.buddy.tools.controller;

import com.buddy.tools.service.ToolCatalog;
import com.buddy.common.tool.ToolResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Date;

@RestController
@RequestMapping("/api/tools")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://192.168.1.2:5173"}, allowCredentials = "false")
public class ToolsController {
    
    private final ToolCatalog toolCatalog;
    
    public ToolsController(ToolCatalog toolCatalog) {
        this.toolCatalog = toolCatalog;
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
    
    @GetMapping("/spec")
    public ResponseEntity<Map<String, Object>> getToolsSpec() {
        return ResponseEntity.ok(toolCatalog.getToolsSpecification());
    }
    
    @PostMapping("/execute/{name}")
    public ResponseEntity<ToolResult> executeTool(@PathVariable String name, 
                                               @RequestBody ToolExecutionRequest request) {
        ToolResult result = toolCatalog.executeTool(name, request.getInput());
        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    // Notes REST API endpoints
    @GetMapping("/notes")
    public ResponseEntity<List<Note>> getNotes() {
        ToolResult result = toolCatalog.executeTool("notes", "list");
        if (result.isSuccess()) {
            // Parse the result to extract notes with content
            List<Note> notes = parseNotesFromResult(result.getResult());
            return ResponseEntity.ok(notes);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/notes")
    public ResponseEntity<Note> createNote(@RequestBody CreateNoteRequest request) {
        String input = "save: " + request.getTitle() + " " + request.getContent();
        ToolResult result = toolCatalog.executeTool("notes", input);
        if (result.isSuccess()) {
            Note note = new Note();
            note.setId(generateId());
            note.setTitle(request.getTitle());
            note.setContent(request.getContent());
            note.setCreatedAt(new Date());
            note.setUpdatedAt(new Date());
            return ResponseEntity.ok(note);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/notes/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable String id) {
        // For now, we'll return success since the NotesTool doesn't support deletion by ID
        // In a real implementation, you'd need to enhance the NotesTool
        return ResponseEntity.ok().build();
    }
    
    private List<Note> parseNotesFromResult(String result) {
        List<Note> notes = new ArrayList<>();
        String[] lines = result.split("\n");
        for (String line : lines) {
            if (line.startsWith("- ")) {
                // Extract title from line like "- My Note (created: Thu Aug 24 17:45:30 UTC 2023)"
                String fullLine = line.substring(2);
                int parenIndex = fullLine.indexOf(" (created:");
                String title = parenIndex > 0 ? fullLine.substring(0, parenIndex) : fullLine;
                
                // Fetch the actual content for this note
                ToolResult contentResult = toolCatalog.executeTool("notes", "get: " + title);
                String content = "";
                if (contentResult.isSuccess()) {
                    // Extract content from the result (format: "Note: <title>\n<content>")
                    String contentText = contentResult.getResult();
                    int contentStart = contentText.indexOf('\n');
                    if (contentStart > 0) {
                        content = contentText.substring(contentStart + 1);
                    }
                }
                
                Note note = new Note();
                note.setId(generateId());
                note.setTitle(title);
                note.setContent(content);
                note.setCreatedAt(new Date());
                note.setUpdatedAt(new Date());
                notes.add(note);
            }
        }
        return notes;
    }
    
    private String generateId() {
        return java.util.UUID.randomUUID().toString();
    }
    
    private static class ToolExecutionRequest {
        private String input;
        
        public String getInput() {
            return input;
        }
        
        public void setInput(String input) {
            this.input = input;
        }
    }
    
    private static class Note {
        private String id;
        private String title;
        private String content;
        private Date createdAt;
        private Date updatedAt;
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Date getCreatedAt() { return createdAt; }
        public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
        public Date getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
    }
    
    private static class CreateNoteRequest {
        private String title;
        private String content;
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
