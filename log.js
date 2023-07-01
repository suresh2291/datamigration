const path = require("path")
const fs = require("fs")
const d = new Date();
const fulldate = d.getFullYear().toString() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
const fulltime = String(d.getHours()).padStart(2, '0')+String(d.getMinutes()).padStart(2, '0')+String(d.getSeconds()).padStart(2, '0');    
const filename = fulldate + fulltime;
class logger{
    action(type, data) {
        const d1 = new Date();
        const timestamp =  d1.toLocaleDateString()+ " " +d1.toLocaleTimeString();
        const logEntry = `${timestamp} - ${type} - ${data}\n`;
        const logFilePath = path.join(__dirname, './logs/'+filename+'.log');  

        fs.appendFile(logFilePath, logEntry, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });
    }
}

module.exports = logger