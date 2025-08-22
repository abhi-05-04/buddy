package com.buddy.tools.controller;

import com.buddy.tools.service.ToolCatalog;
import com.buddy.common.tool.ToolResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/tools")
@CrossOrigin(origins = "*")
public class ToolsController {
    
    private final ToolCatalog toolCatalog;
    
    public ToolsController(ToolCatalog toolCatalog) {
        this.toolCatalog = toolCatalog;
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
    
    private static class ToolExecutionRequest {
        private String input;
        
        public String getInput() {
            return input;
        }
        
        public void setInput(String input) {
            this.input = input;
        }
    }
}
