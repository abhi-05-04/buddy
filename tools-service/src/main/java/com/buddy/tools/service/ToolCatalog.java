package com.buddy.tools.service;

import com.buddy.common.tool.Tool;
import com.buddy.common.tool.ToolResult;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import jakarta.annotation.PostConstruct;

@Service
public class ToolCatalog {
    
    private final Map<String, Tool> tools = new HashMap<>();
    
    @PostConstruct
    public void initializeTools() {
        tools.put("notes", new NotesTool());
        tools.put("web_search", new WebSearchTool());
    }
    
    public ToolResult executeTool(String toolName, String input) {
        Tool tool = tools.get(toolName);
        if (tool == null) {
            return ToolResult.failure("Tool not found: " + toolName);
        }
        
        try {
            return tool.execute(input);
        } catch (Exception e) {
            return ToolResult.failure("Tool execution failed: " + e.getMessage());
        }
    }
    
    public Map<String, Object> getToolsSpecification() {
        Map<String, Object> spec = new HashMap<>();
        List<Map<String, String>> toolSpecs = new ArrayList<>();
        
        for (Tool tool : tools.values()) {
            Map<String, String> toolSpec = new HashMap<>();
            toolSpec.put("name", tool.getName());
            toolSpec.put("description", tool.getDescription());
            toolSpec.put("inputSchema", tool.getInputSchema());
            toolSpecs.add(toolSpec);
        }
        
        spec.put("tools", toolSpecs);
        return spec;
    }
}
