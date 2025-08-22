package com.buddy.common.tool;

public class ToolResult {
    private boolean success;
    private String result;
    private String error;
    
    public ToolResult() {}
    
    public ToolResult(boolean success, String result) {
        this.success = success;
        this.result = result;
    }
    
    public ToolResult(boolean success, String result, String error) {
        this.success = success;
        this.result = result;
        this.error = error;
    }
    
    public static ToolResult success(String result) {
        return new ToolResult(true, result);
    }
    
    public static ToolResult failure(String error) {
        return new ToolResult(false, null, error);
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getResult() {
        return result;
    }
    
    public void setResult(String result) {
        this.result = result;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
}
