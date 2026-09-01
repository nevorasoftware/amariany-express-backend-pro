package com.amairany.express.repository;

import com.amairany.express.model.RutaEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RutaEntregaRepository extends JpaRepository<RutaEntrega, String> {

    List<RutaEntrega> findByActivoTrueOrderByCreatedAtDesc();

    @Query("SELECT r FROM RutaEntrega r WHERE r.activo = true " +
           "AND (:dept IS NULL OR LOWER(r.departamentoNombre) = LOWER(:dept)) " +
           "AND (:mun IS NULL OR LOWER(r.municipioNombre) = LOWER(:mun)) " +
           "AND (:dist IS NULL OR LOWER(r.distritoNombre) = LOWER(:dist)) " +
           "AND (:search IS NULL OR LOWER(r.lugarPrincipal) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(r.lugarReferencia) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY r.createdAt DESC")
    List<RutaEntrega> findFilteredRoutes(
            @Param("dept") String departamento,
            @Param("mun") String municipio,
            @Param("dist") String distrito,
            @Param("search") String search
    );

    List<RutaEntrega> findByLugarPrincipalIgnoreCaseAndLugarReferenciaIgnoreCase(String lugarPrincipal, String lugarReferencia);
}
