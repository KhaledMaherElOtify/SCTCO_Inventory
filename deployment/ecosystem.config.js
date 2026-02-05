{
  "apps": [
    {
      "name": "inventory-api",
      "script": "src/server.js",
      "cwd": "/path/to/backend",
      "instances": 2,
      "exec_mode": "cluster",
      "error_file": "logs/err.log",
      "out_file": "logs/out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "watch": false,
      "ignore_watch": [
        "node_modules",
        "logs",
        "data"
      ],
      "env": {
        "NODE_ENV": "production",
        "PORT": "3001",
        "HOST": "0.0.0.0"
      },
      "autorestart": true,
      "max_restarts": 10,
      "min_uptime": "30s",
      "max_memory_restart": "500M"
    }
  ]
}
