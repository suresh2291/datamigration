
const mssql_config = {
    user: "username",
    password: "password",
    server: "server",
    port: 1433,
    database: "databse",
    trustServerCertificate: true
};

const mysql_config = {
    host: "localhost",
    port: 3306,
    user: "username",
    password: "password",
    database: 'databse'
};

const source = { type: 'mysql', connectstring: mysql_config };
const target = { type: 'mongodb', connectstring: 'mongodb_string' };

const mapping = [
    {target_table:"users", source_query_file:"SAMPLE.sql", actual_table:"user_details"},
    
]
module.exports = { source, target, mapping };
