package com.amairany.express.dto;

public class LogoUploadRequest {
    private String imageBase64;
    private String filename;

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
}
