module.exports = {
    server: "SQLEXPRESS01",
    user: 'sa',
    password:"1234",
    database: "sales",
    port:1433,
    options: {
        trustedConnection: true,
        encrypt: true, // Ensure SSL encryption
       trustServerCertificate: true
    },
}
