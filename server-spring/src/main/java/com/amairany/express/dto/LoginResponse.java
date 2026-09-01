package com.amairany.express.dto;

import com.amairany.express.model.User;

public class LoginResponse {
    private boolean success;
    private String token;
    private User user;

    public LoginResponse(boolean success, String token, User user) {
        this.success = success;
        this.token = token;
        this.user = user;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
