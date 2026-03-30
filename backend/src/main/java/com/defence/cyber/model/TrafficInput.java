package com.defence.cyber.model;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrafficInput {

    @NotBlank
    private String sourceIp;

    @NotBlank
    private String destinationIp;

    @NotNull
    private Integer destinationPort;

    @NotNull
    @Min(0)
    private Double packetRate;

    @NotNull
    @Min(0)
    private Integer failedLogins;   // ✅ FIXED (was Double before)

    @NotNull
    @Min(0)
    private Double unusualPayloadScore;
}