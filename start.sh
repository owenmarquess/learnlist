#!/bin/bash

# Kill existing node processes using port 3002
PID=$(lsof -t -i:3002)
if [ -n "$PID" ]; then
  kill -9 $PID
fi

# Start the server
nodemon server.js
