# Configuración básica de Liquidsoap
radio = fallback(track_sensitive=false, [playlist(reload=10, "/app/audio/extremoduro.mp3"), blank(duration=10.)])

# Emitir el audio a Icecast
output.icecast(%mp3, host="icecast", port=8000, password="sourcepass", mount="/stream", radio)
