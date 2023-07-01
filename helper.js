const { MongoClient } = require('mongodb');
const { Pool } = require('pg');
const mysql = require('mysql');
const sql = require('mssql');
const log = require("./log.js");

const Log = new log();

class Helper {
    async dbquery(db_type,conn_str,query,tablename) {
      let output;
      switch (db_type) {
        case 'mssql':
          output = await this.mssql_execute(conn_str, query);
          break;
        case 'mysql':
          output = await this.mysql_execute(conn_str, query);
          
          break;
        case 'pgsql':
          output = await this.pg_execute(conn_str, query);
          
          break;
        case 'mongodb':
          output = await this.mongodb_execute(conn_str, query, tablename);
          
          break;
        default:
          console.log("output=========================================",output)
          throw new Error('Invalid database type');
      }
      return output;
    }
 
    async mssql_execute(conn_str, query) {
      try{
        await sql.connect(conn_str)
        Log.action("Connection established with MS Sql Server("+JSON.stringify(conn_str)+")","Success");
        Log.action("MS SQL: Query", query);
        const output = await sql.query(query);
        Log.action("MS SQL: Number of rows effected",output.rowsAffected);
        sql.close();
        Log.action("MS SQL: Connection is closed", "Success");
        return output.recordsets[0];
      } catch (err) {
          Log.action("MS SQL: Failed to establish connection",err);
          return;
      }
    }
 
    async mysql_execute(conn_str, query) {
      try{
        const conn = mysql.createConnection(conn_str);
        conn.connect();
        Log.action("Connection established with MySql("+conn_str+")","Success");
        Log.action("Query", query);
        const result = await new Promise((resolve, reject) => {
          conn.query(query, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        });
        Log.action("mySQL: Number of rows effected",result.length);
        conn.end();
        Log.action("MySQL: Connection is closed", "Success");
        const processedResults = result.map((row) => {
          const jsonData = JSON.parse(row.jsonData, (key, value) => {
            if (typeof value === 'string' && value.startsWith('new Date(')) {
              const dateValue = value.match(/new Date\("(.+)"\)/);
              return dateValue ? new Date(dateValue[1]) : value;
            } else if (value === 'true') {
              return true;
            } else if (value === 'false') {
              return false;
            }
            return value;
          });
        
          return jsonData;
        });
        
        return processedResults;
      } catch (err) {
        Log.action("MySQL: Failed to establish connection",err);
        return;
      }  
    }

    async mysql_execute_actual_table_rowcount(conn_str, actual_table) {
      try{
        const conn = mysql.createConnection(conn_str);
        conn.connect();
        Log.action("Connection established with MySql("+conn_str+")","Success");
        Log.action("MySQL: Actual Table", actual_table);
        const result = await new Promise((resolve, reject) => {
          conn.query("select count(*) cnt from " + actual_table, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        });
        const total_rows_count = result[0].cnt;
        Log.action("MySQL: Number of rows in actual table ",total_rows_count);
        conn.end();
        Log.action("MySQL: Table Row Count Connection is closed", "Success");
        
        return total_rows_count;
      }catch (err) {
        Log.action("MySQL: Table Row Count error: ",err);
        return;
      }
    }

    async pg_execute(conn_str, query) {
      const pool = new Pool({ connectionString: conn_str });
      const client = await pool.connect();
      Log.action("Postgres: Connection established with Postgres("+conn_str+")","Success");
      try {
        
        Log.action("Query", query);
        const { rows } = await client.query(query);
        
        Log.action(" Postgres: Number of rows effected",rows.length);
        return rows;
      } catch (err) {
        Log.action("Postgres: Failed to establish connection",err);
        return;
      } finally {
        client.release();
        Log.action("Postgres: Connection is closed", "Success");
      }
    }

    async mongodb_execute(conn_str, query, collectionname) {
      try{
        const client = new MongoClient(conn_str);
        await client.connect();
        Log.action("Connection established with Mongo DB("+conn_str+")","Success")
        const db = client.db();
        const collection = db.collection(collectionname);
        Log.action("MongoDB: Insert into Result  ", JSON.stringify(query));      
        const result = await collection.insertMany(query);
        Log.action("MongoDB: Execution Success. Number of rows effected",result.insertedCount);
        await client.close();
        Log.action("MongoDB: Connection is closed", "Success")
        Log.action("--------------------------------","-------------------------------")      
        return result;
      } catch (err) {
        Log.action("MongoDB: Failed to establish connection",err);
        return;
      }
    }

    async mongodb_execute_drop_collection(conn_str) {
      try {
        const client = new MongoClient(conn_str);
      await client.connect();
      Log.action("Drop Collections: Connection established with Mongo DB("+conn_str+")","Success")
      const db = client.db();

      var collections =  await db.listCollections().toArray();
      for (const collection of collections) {
        await db.collection(collection.name).drop();
      }      
      await client.close();
      Log.action("MongoDB: Drop Collections: Connection is closed", "Success")
      Log.action("--------------------------------","-------------------------------")      
      return;
      } catch (err) {
        Log.action("MongoDB: Drop Collection Error: ",err);
        return;
      }
    }    

    async lastprocess(conn_str){
      var query;
      const client = new MongoClient(conn_str);
      await client.connect();
      const db = client.db();
      const collection = db.collection("lastprocess");
      var mysort = { startdate: -1 };
      const res = await collection.find().sort(mysort).toArray();
      if (res.length == 0){
        query = {startdate:new Date("2000-01-01"), enddate: new Date()}
        await collection.insertOne(query);
      }
      else{
        query = {startdate:res[0].enddate, enddate: new Date()}
        await collection.insertOne(query);        
      }
      await client.close();      
      return query;
    }
}

module.exports = Helper