package com.buddy.common.tool;

public interface Tool {
    String getName();
    String getDescription();
    String getInputSchema();
    ToolResult execute(String input);
}
