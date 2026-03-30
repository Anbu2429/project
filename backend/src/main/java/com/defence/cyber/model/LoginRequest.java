package com.defence.cyber.model;

import lombok.Data;

@Data
public class LoginRequest {

    private String username;
    private String password;
    private String ipAddress;

}