package com.scorer.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    /**
     * Forces Spring's auto-configured Jackson ObjectMapper (the one actually
     * used to serialize @RestController responses) to write java.time types
     * as ISO-8601 strings instead of numeric timestamp arrays.
     *
     * The application.properties setting
     * (spring.jackson.serialization.write-dates-as-timestamps=false) does
     * the same thing, but this customizer guarantees it even if that
     * property is ever missing, overridden, or not picked up by a given
     * build/profile.
     */
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer dateSerializationCustomizer() {
        return builder -> builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
