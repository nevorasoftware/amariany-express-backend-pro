package com.amairany.express.service;

import com.amairany.express.model.RutaEntrega;
import com.amairany.express.repository.RutaEntregaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RutaService {

    @Autowired
    private RutaEntregaRepository rutaRepository;

    public List<RutaEntrega> getRoutes(String departamento, String municipio, String distrito, String search) {
        String deptParam = (departamento != null && !departamento.trim().isEmpty()) ? departamento.trim() : null;
        String munParam = (municipio != null && !municipio.trim().isEmpty()) ? municipio.trim() : null;
        String distParam = (distrito != null && !distrito.trim().isEmpty()) ? distrito.trim() : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        return rutaRepository.findFilteredRoutes(deptParam, munParam, distParam, searchParam);
    }

    public RutaEntrega saveRoute(RutaEntrega ruta) {
        if (ruta.getLugarPrincipal() == null || ruta.getLugarPrincipal().trim().isEmpty()) {
            throw new IllegalArgumentException("El campo lugarPrincipal es requerido");
        }
        if (ruta.getLugarReferencia() == null || ruta.getLugarReferencia().trim().isEmpty()) {
            throw new IllegalArgumentException("El campo lugarReferencia es requerido");
        }

        // Evitar duplicados exactos
        List<RutaEntrega> existing = rutaRepository.findByLugarPrincipalIgnoreCaseAndLugarReferenciaIgnoreCase(
                ruta.getLugarPrincipal().trim(),
                ruta.getLugarReferencia().trim()
        );
        if (!existing.isEmpty()) {
            throw new IllegalArgumentException("Ya existe una ruta registrada con este lugar principal y referencia");
        }

        return rutaRepository.save(ruta);
    }

    public RutaEntrega updateRoute(String id, RutaEntrega updatedData) {
        Optional<RutaEntrega> existingOpt = rutaRepository.findById(id);
        if (existingOpt.isEmpty()) {
            throw new IllegalArgumentException("Ruta con ID " + id + " no encontrada");
        }

        RutaEntrega existing = existingOpt.get();
        if (updatedData.getLugarPrincipal() != null) existing.setLugarPrincipal(updatedData.getLugarPrincipal());
        if (updatedData.getLugarReferencia() != null) existing.setLugarReferencia(updatedData.getLugarReferencia());
        if (updatedData.getDias() != null) existing.setDias(updatedData.getDias());
        if (updatedData.getHorario() != null) existing.setHorario(updatedData.getHorario());
        if (updatedData.getImagenUrl() != null) existing.setImagenUrl(updatedData.getImagenUrl());
        if (updatedData.getTipoPunto() != null) existing.setTipoPunto(updatedData.getTipoPunto());
        if (updatedData.getActivo() != null) existing.setActivo(updatedData.getActivo());
        if (updatedData.getDepartamentoNombre() != null) existing.setDepartamentoNombre(updatedData.getDepartamentoNombre());
        if (updatedData.getMunicipioNombre() != null) existing.setMunicipioNombre(updatedData.getMunicipioNombre());
        if (updatedData.getDistritoNombre() != null) existing.setDistritoNombre(updatedData.getDistritoNombre());

        return rutaRepository.save(existing);
    }

    public void deleteRoute(String id) {
        if (!rutaRepository.existsById(id)) {
            throw new IllegalArgumentException("Ruta con ID " + id + " no encontrada");
        }
        rutaRepository.deleteById(id);
    }
}
