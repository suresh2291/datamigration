# SQL to MongoDB Data Migration Script
This script allows you to migrate data from SQL databases to MongoDB. It automates the process of converting SQL data into JSON format and importing it into MongoDB collections. No code changes are required, only configuration adjustments.

# Installation
Clone the repository to your local machine.
Install the required dependencies by running npm install.

# Configuration
Before running the script, you need to configure the migration settings.
- create "logs" folder in root directory. 
- Open the "config.js" file located in the project's root directory.
- Update the "SQL" property to specify the path where your SQL files are located.
- Set the connectionString property to the connection string of your SQL database.
- Specify the target collection in the targetCollection property.
- For each SQL file, add an entry in the migrations array. Provide the following information:
- sqlFile: The name of the SQL file.
- sourceTable: The name of the table in the SQL database.
- targetCollection: (Optional) Override the default target collection for this specific migration.
     Usage
- Place your SQL files in the designated folder specified in the configuration.
- Run the migration script by executing node main.js in the terminal.

The script will process each SQL file, convert the data into JSON format, and import it into the MongoDB collections.
Monitor the console output for progress updates and any potential errors.
Once the migration is complete, verify the data in the MongoDB collections.

**Note**: Ensure that your SQL files provide output in JSON format for successful migration.