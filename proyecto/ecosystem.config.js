module.exports = {
  apps: [
    {
      name: "casos-stia",
      script: "npm",
      args: "start",
      cwd: "/data/casos",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      out_file: "/data/casos/logs/app-out.log",
      error_file: "/data/casos/logs/app-error.log",
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 5000,
      cron_restart: "0 4 * * *", // Restart daily at 4 AM
    },
  ],
};
