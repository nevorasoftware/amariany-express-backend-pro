package com.amairany.express.controller;

import com.amairany.express.dto.ApiResponse;
import com.amairany.express.dto.LogoUploadRequest;
import com.amairany.express.model.SiteConfig;
import com.amairany.express.service.SiteConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
public class SiteConfigController {

    @Autowired
    private SiteConfigService siteConfigService;

    @GetMapping
    public ResponseEntity<ApiResponse<SiteConfig>> getConfig() {
        SiteConfig config = siteConfigService.getConfig();
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SiteConfig>> updateConfig(@RequestBody SiteConfig config) {
        SiteConfig updated = siteConfigService.updateConfig(config);
        return ResponseEntity.ok(ApiResponse.success("Configuración actualizada", updated));
    }

    @PostMapping("/logo")
    public ResponseEntity<ApiResponse<SiteConfig>> updateLogo(@RequestBody LogoUploadRequest request) {
        if (request.getImageBase64() == null || request.getImageBase64().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Base64 de imagen requerido"));
        }

        String logoUrl = request.getImageBase64();
        SiteConfig updated = siteConfigService.updateLogoUrl(logoUrl);

        return ResponseEntity.ok(ApiResponse.success("Logo actualizado en base de datos", updated));
    }
}
