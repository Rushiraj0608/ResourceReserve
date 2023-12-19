/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
    output: "standalone",
    reactStrictMode: true,
    experimental: {
        outputFileTracingRoot: path.join(__dirname, "../../"),
        esmExternals: false,
    },
    images: {
        domains: ["upload.wikimedia.org", "lh3.googleusercontent.com"],
    },
}

module.exports = nextConfig
