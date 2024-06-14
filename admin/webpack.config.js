module.exports = {
    module: {
        rules: [
            // other rules
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
        ],
    },
};
