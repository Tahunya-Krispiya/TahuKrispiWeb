// --- PM2 Ecosystem Config — TahuKrispiWeb -----------------------------------
// Jalankan dengan: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "tahukrispi-web",
      script: "dist/index.js",
      interpreter: "node",
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      watch: false,
      max_memory_restart: "300M",
      restart_delay: 4000,
      max_restarts: 10,
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
