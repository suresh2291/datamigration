const { source, target, mapping } = require("./config.js")
const helper = require("./helper.js")
const fs = require("fs")
const path = require("path")
const log = require("./log.js")
const Log = new log()
const Helper = new helper()

async function main() {
  Log.action("Process started", "")
  Log.action("--------------------------------","-------------------------------")
  try {
    await Helper.mongodb_execute_drop_collection(target.connectstring);
    sqlFolderPath = "./SQL";
    for (const mapobj of mapping) {
      const total_rows_count = await Helper.mysql_execute_actual_table_rowcount(source.connectstring, mapobj.actual_table);
      console.log("Actual Table: " + mapobj.actual_table + " - Total Rows: " + total_rows_count);
      console.log("Target Table: " + mapobj.target_table + " - Source Query File:" + mapobj.source_query_file);
      console.log("-----------------started",new Date(),"---------------------");
      const limit = 200000
      for (let i = 0; i < total_rows_count;) {
        try {
            const now = Date.now();
            console.time(`id: ${now}  - took: `);
            const filename = mapobj.source_query_file;
            const filePath = path.join(sqlFolderPath, filename);
            let sqlQuery;
            try {
              sqlQuery = fs.readFileSync(filePath, 'utf-8');
              sqlQuery = sqlQuery.replaceAll(`@limit`, `limit ${i}, ${limit}`);
              i = i + limit;
              Log.action("Reading data from "+filename,"success")
            } catch (error) {
                Log.action(`An error occurred while reading the file data ${filePath}:`, error);
            }   
            const target_query = await Helper.dbquery(
              source.type,
              source.connectstring,
              sqlQuery
            );
            await Helper.dbquery(
              target.type,
              target.connectstring,
              target_query,
              mapobj.target_table
            );
            console.log(new Date() + " - Number rows processed: " + (total_rows_count < i ? total_rows_count : i ))
            console.timeEnd(`id: ${now}  - took: `)
        } catch (error) {
            Log.action("file not found", error);
        }
      }
      console.log("-----------------ended",new Date(),"---------------------");
    }
    Log.action("Process Ended", "") 
    return;   
  } catch (error) {
    Log.action("An error occurred:", error);
    return;
  }
}

main();