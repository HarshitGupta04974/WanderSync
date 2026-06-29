package com.travel.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationConfig {
    // Keeping this class clean and open for non-security, general beans later.
    // Duplicate authenticationProvider and passwordEncoder beans have been removed.
}