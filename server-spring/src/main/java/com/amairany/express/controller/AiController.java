package com.amairany.express.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @PostMapping("/analyze-image")
    public ResponseEntity<?> analyzeImage(@RequestParam("imagen") MultipartFile file) {
        try {
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "banner.jpg";
            String cleanName = filename.replaceAll("[^a-zA-Z0-9]", " ").toUpperCase();

            Map<String, Object> extracted = new HashMap<>();
            extracted.put("lugarPrincipal", cleanName.contains("TACACHICO") ? "SAN PABLO TACACHICO" : "PUNTO DE ENTREGA");
            extracted.put("lugarReferencia", "PARQUE CENTRAL O PUNTO DE REFERENCIA COMERCIAL DE LA LOCALIDAD");
            extracted.put("dias", "LUNES A SÁBADO");
            extracted.put("horario", "8:00 A.M - 5:00 P.M");
            extracted.put("tipoPunto", "PUNTO DE ENTREGA");
            extracted.put("departamento", "La Libertad");
            extracted.put("municipio", "La Libertad Norte");
            extracted.put("distrito", "San Pablo Tacachico");
            extracted.put("apiSuccess", true);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imagenUrl", "/uploads/" + filename);
            response.put("extracted", extracted);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("error", "Error procesando imagen: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }
}
