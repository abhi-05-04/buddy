package com.buddy.memory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = {"com.buddy.memory", "com.buddy.common.memory"})
public class BuddyMemoryApplication {
    public static void main(String[] args) {
        SpringApplication.run(BuddyMemoryApplication.class, args);
    }
}
