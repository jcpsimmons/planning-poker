echo "Starting planning poker..."
docker-compose up -d --build &>/dev/null
sleep 2
URL=$(docker-compose run busybox-curl curl http://ngrok:4040/api/tunnels | grep -Po "https"://[^\"]+)
echo "Planning poker is up! Url: $URL"
docker-compose rm -fsv busybox_curl &>/dev/null
