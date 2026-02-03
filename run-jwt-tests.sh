#!/bin/bash

# Start backend server in background
echo "Starting backend server..."
cd apps/backend
pnpm dev &
SERVER_PID=$!
sleep 5

# Test 1: Missing Authorization header
echo ""
echo "TEST 1: Missing Authorization header"
curl -s -w "\n%{http_code}\n" http://localhost:3000/api/test-auth > ../../.sisyphus/evidence/task-1-missing-auth.txt
cat ../../.sisyphus/evidence/task-1-missing-auth.txt

# Test 2: Invalid/malformed token
echo ""
echo "TEST 2: Invalid token"
curl -s -w "\n%{http_code}\n" http://localhost:3000/api/test-auth \
  -H "Authorization: Bearer invalid.token.here" > ../../.sisyphus/evidence/task-1-invalid-jwt.txt
cat ../../.sisyphus/evidence/task-1-invalid-jwt.txt

# Test 3: Valid token (need to login first)
echo ""
echo "TEST 3: Getting valid token via login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tugestionamiga.com","password":"admin123"}')
echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
  echo "Token found: ${TOKEN:0:20}..."
  echo ""
  echo "TEST 3: Valid token"
  curl -s http://localhost:3000/api/test-auth \
    -H "Authorization: Bearer $TOKEN" > ../../.sisyphus/evidence/task-1-valid-jwt.json
  echo "Valid token response:"
  cat ../../.sisyphus/evidence/task-1-valid-jwt.json
else
  echo "Failed to get token"
fi

# Stop server
echo ""
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo ""
echo "Integration tests complete!"
