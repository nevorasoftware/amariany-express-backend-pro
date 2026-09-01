package com.amairany.express.controller;

import com.amairany.express.dto.ApiResponse;
import com.amairany.express.model.RutaEntrega;
import com.amairany.express.service.RutaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RutaController {

    @Autowired
    private RutaService rutaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RutaEntrega>>> getRoutes(
            @RequestParam(required = false) String departamento,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) String distrito,
            @RequestParam(required = false) String search) {
        
        List<RutaEntrega> routes = rutaService.getRoutes(departamento, municipio, distrito, search);
        return ResponseEntity.ok(ApiResponse.success(routes));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createRoute(@RequestBody RutaEntrega ruta) {
        try {
            RutaEntrega created = rutaService.saveRoute(ruta);
            return ResponseEntity.ok(ApiResponse.success("Ruta creada exitosamente", created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al guardar la ruta: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateRoute(@PathVariable String id, @RequestBody RutaEntrega ruta) {
        try {
            RutaEntrega updated = rutaService.updateRoute(id, ruta);
            return ResponseEntity.ok(ApiResponse.success("Ruta actualizada exitosamente", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al actualizar la ruta: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteRoute(@PathVariable String id) {
        try {
            rutaService.deleteRoute(id);
            return ResponseEntity.ok(ApiResponse.success("Ruta eliminada exitosamente", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Error al eliminar la ruta: " + e.getMessage()));
        }
    }
}
