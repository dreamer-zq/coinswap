module.exports = {
    devServer: {
        https: true,
        port: 8081,
        // proxy: {
        //     '/api': {
        //         target: 'http://localhost:8080/api',
        //         changeOrigin: true,
        //         // pathRewrite: {
        //         //     '^/api': ''
        //         // }
        //     }
        // }
    }
};
