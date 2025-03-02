# Usamos la imagen base de Debian
FROM debian:latest

# Establecer el directorio de trabajo
WORKDIR /etc/ices2

# Actualizamos los repositorios y luego instalamos Ices2 y Vorbis-tools
RUN apt-get update && \
    apt-get install -y ices2 vorbis-tools && \
    rm -rf /var/lib/apt/lists/*

# Comando para iniciar Ices2 con el archivo de configuración
CMD ["ices2", "/etc/ices2/ices-playlist.xml"]
