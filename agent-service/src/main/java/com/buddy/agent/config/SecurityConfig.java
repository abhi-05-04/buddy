package com.buddy.agent.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
// import org.springframework.security.config.web.server.ServerHttpSecurity;
// import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
// @EnableWebFluxSecurity
public class SecurityConfig {
    
   // @Bean
   // public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
   //     http
   //         .csrf(csrf -> csrf.disable())
   //         .cors(cors -> cors.configurationSource(corsConfigurationSource()))
   //         .authorizeExchange(authz -> authz
   //             .pathMatchers("/actuator/**").permitAll()
   //             .anyExchange().authenticated()
   //         )
   //         .httpBasic(httpBasic -> httpBasic.disable())
   //         .formLogin(formLogin -> formLogin.disable());
   //     
   //     return http.build();
   // }
    
    @Bean
    public org.springframework.web.cors.reactive.CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOriginPatterns(java.util.List.of("*"));
        corsConfig.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        corsConfig.setAllowedHeaders(java.util.List.of("*"));
        corsConfig.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        
        return source;
    }
    
    @Bean
    public CorsWebFilter corsWebFilter() {
        return new CorsWebFilter(corsConfigurationSource());
    }
}
