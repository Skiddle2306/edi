#!/bin/bash
set -e

MAIN_SERVER="http://10.249.244.172:5050"   # replace MAIN_SERVER_HOST or pass as env var

read -p "Enter server name (alphanumeric, no spaces): " SERVER_NAME
read -p "Enter full path to your log file (e.g. /var/log/nginx/access.log): " LOG_FILE

# generate random 8-char password (alphanumeric)
PASSWORD=$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 8)

echo "Registering client '$SERVER_NAME' with main server..."

# call main server registration
RESP=$(curl -s -w "%{http_code}" -o /tmp/register_resp.json \
  -X POST "${MAIN_SERVER}/api/register" \
  -H "Content-Type: application/json" \
  -d "{\"clientName\":\"$SERVER_NAME\",\"password\":\"$PASSWORD\"}")

HTTP_CODE=$RESP

if [ "$HTTP_CODE" != "200" ]; then
  echo "Registration failed. Main server response:"
  cat /tmp/register_resp.json
  exit 1
fi

echo "Registration OK."

# write client config
cat > client-config.properties <<EOF
client.name=$SERVER_NAME
client.log=$LOG_FILE
server.url=http://10.249.244.172:5050
EOF

# overwrite application.properties datasource settings for client
cat > src/main/resources/application.properties <<EOF
server.port=2020
spring.datasource.url=jdbc:postgresql://10.249.244.172:5432/servermanager
spring.datasource.username=$SERVER_NAME
spring.datasource.password=$PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=none
EOF

echo "Wrote client-config.properties and application.properties (datasource)."
echo "Start your client Spring Boot app (mvn spring-boot:run or via IntelliJ)."
