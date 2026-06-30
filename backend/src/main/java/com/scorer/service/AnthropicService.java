package com.scorer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scorer.dto.ScoreDto;
import com.scorer.model.ScoreStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnthropicService {

    @Value("${anthropic.api.key}")
    private String apiKey;

    @Value("${anthropic.api.url}")
    private String apiUrl;

    @Value("${anthropic.model}")
    private String model;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public ScoreDto generateScore(String submissionText) {
        String prompt = buildScoringPrompt(submissionText);

        Map<String, Object> requestBody = Map.of(
            "model", model,
            "max_tokens", 2000,
            "messages", List.of(
                Map.of("role", "user", "content", prompt)
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl, HttpMethod.POST, entity, String.class
            );

            return parseAnthropicResponse(response.getBody());
        } catch (Exception e) {
            log.error("Error calling Anthropic API: {}", e.getMessage());
            throw new RuntimeException("Failed to generate score from Claude: " + e.getMessage());
        }
    }

    private String buildScoringPrompt(String submissionText) {
        return """
            You are an expert evaluator assessing a candidate's submission for a business/marketing role.
            
            Score the following submission across EXACTLY these five pillars. Each pillar is scored out of 20.
            
            PILLARS:
            1. Analytical Rigour - Use of data, evidence, and structured thinking
            2. Commercial Acumen - Business awareness, market understanding, revenue thinking
            3. Quality of Output - Thoroughness, professionalism, and completeness of work
            4. Communication - Clarity, conciseness, and effectiveness of communication
            5. Initiative and Ownership - Proactiveness, decision-making, and taking responsibility
            
            SUBMISSION:
            "%s"
            
            Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
            {
              "analyticalRigourScore": <integer 0-20>,
              "analyticalRigourFeedback": "<2-3 sentence feedback>",
              "commercialAcumenScore": <integer 0-20>,
              "commercialAcumenFeedback": "<2-3 sentence feedback>",
              "qualityOfOutputScore": <integer 0-20>,
              "qualityOfOutputFeedback": "<2-3 sentence feedback>",
              "communicationScore": <integer 0-20>,
              "communicationFeedback": "<2-3 sentence feedback>",
              "initiativeOwnershipScore": <integer 0-20>,
              "initiativeOwnershipFeedback": "<2-3 sentence feedback>"
            }
            """.formatted(submissionText);
    }

    private ScoreDto parseAnthropicResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        String content = root.path("content").get(0).path("text").asText();

        // Strip any markdown fences if present
        content = content.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();

        JsonNode scoreNode = objectMapper.readTree(content);

        return ScoreDto.builder()
            .analyticalRigourScore(scoreNode.path("analyticalRigourScore").asInt())
            .analyticalRigourFeedback(scoreNode.path("analyticalRigourFeedback").asText())
            .commercialAcumenScore(scoreNode.path("commercialAcumenScore").asInt())
            .commercialAcumenFeedback(scoreNode.path("commercialAcumenFeedback").asText())
            .qualityOfOutputScore(scoreNode.path("qualityOfOutputScore").asInt())
            .qualityOfOutputFeedback(scoreNode.path("qualityOfOutputFeedback").asText())
            .communicationScore(scoreNode.path("communicationScore").asInt())
            .communicationFeedback(scoreNode.path("communicationFeedback").asText())
            .initiativeOwnershipScore(scoreNode.path("initiativeOwnershipScore").asInt())
            .initiativeOwnershipFeedback(scoreNode.path("initiativeOwnershipFeedback").asText())
            .status(ScoreStatus.DRAFT)
            .build();
    }
}
