package com.amairany.express.service;

import com.amairany.express.model.SiteConfig;
import com.amairany.express.repository.SiteConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SiteConfigService {

    @Autowired
    private SiteConfigRepository siteConfigRepository;

    public SiteConfig getConfig() {
        Optional<SiteConfig> configOpt = siteConfigRepository.findById("default");
        if (configOpt.isPresent()) {
            return configOpt.get();
        }
        SiteConfig defaultConfig = new SiteConfig();
        return siteConfigRepository.save(defaultConfig);
    }

    public SiteConfig updateConfig(SiteConfig newConfig) {
        SiteConfig current = getConfig();
        if (newConfig.getLogoUrl() != null) current.setLogoUrl(newConfig.getLogoUrl());
        if (newConfig.getSiteName() != null) current.setSiteName(newConfig.getSiteName());
        if (newConfig.getPrimaryColor() != null) current.setPrimaryColor(newConfig.getPrimaryColor());
        if (newConfig.getSecondaryColor() != null) current.setSecondaryColor(newConfig.getSecondaryColor());
        if (newConfig.getBgColor() != null) current.setBgColor(newConfig.getBgColor());

        return siteConfigRepository.save(current);
    }

    public SiteConfig updateLogoUrl(String logoUrl) {
        SiteConfig current = getConfig();
        current.setLogoUrl(logoUrl);
        return siteConfigRepository.save(current);
    }
}
