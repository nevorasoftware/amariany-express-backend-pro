package com.amairany.express.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "\"RutaEntrega\"")
public class RutaEntrega {

    @Id
    private String id;

    @Column(nullable = false)
    private String lugarPrincipal;

    @Column(columnDefinition = "TEXT")
    private String lugarReferencia;

    private String dias;

    private String horario;

    @Column(columnDefinition = "TEXT")
    private String imagenUrl;

    private String tipoPunto = "PUNTO DE ENTREGA";

    private Boolean activo = true;

    private String departamentoNombre;

    private String municipioNombre;

    private String distritoNombre;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters y Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLugarPrincipal() { return lugarPrincipal; }
    public void setLugarPrincipal(String lugarPrincipal) { this.lugarPrincipal = lugarPrincipal; }

    public String getLugarReferencia() { return lugarReferencia; }
    public void setLugarReferencia(String lugarReferencia) { this.lugarReferencia = lugarReferencia; }

    public String getDias() { return dias; }
    public void setDias(String dias) { this.dias = dias; }

    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public String getTipoPunto() { return tipoPunto; }
    public void setTipoPunto(String tipoPunto) { this.tipoPunto = tipoPunto; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public String getDepartamentoNombre() { return departamentoNombre; }
    public void setDepartamentoNombre(String departamentoNombre) { this.departamentoNombre = departamentoNombre; }

    public String getMunicipioNombre() { return municipioNombre; }
    public void setMunicipioNombre(String municipioNombre) { this.municipioNombre = municipioNombre; }

    public String getDistritoNombre() { return distritoNombre; }
    public void setDistritoNombre(String distritoNombre) { this.distritoNombre = distritoNombre; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
