const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

module.exports = (context, serviceName) => {
    return createProxyMiddleware(context, {
        target: services[serviceName],
        changeOrigin: true,
        pathRewrite: {
            [`^${context}`]: '', // Remove the context prefix (e.g., /api/movies) exactly
        },
        onError: (err, req, res) => {
            console.error(`[Proxy Error] Context: ${context} Service: ${serviceName}`, err.message);
            res.status(502).json({
                message: 'Dịch vụ đang gặp sự cố, vui lòng thử lại sau.',
                service: serviceName
            });
        },
        onProxyRes: (proxyRes, req, res) => {
            // Optional: Headers cleanup if needed
            // console.log(`[Proxy Success] ${req.method} ${req.url} -> ${services[serviceName]}`);
        }
    });
};
