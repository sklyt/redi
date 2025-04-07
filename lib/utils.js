/**
 * Very useful, inspired the the charmcli formatter, for clear and well formated logs
 * 
 * Levels define the type of a log 
 *
 */


function createDebugLib() {
    let isDebugEnabled = false;  // disabled by default
    let logLevel = 'info'; // Default log level
  
    const levels = ['error', 'warn', 'info', 'debug'];
  
    function Debug(enable, message, level = 'info') {
      if (enable && levels.indexOf(level) <= levels.indexOf(logLevel)) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
      }
    }
  
    function setDebug(enabled, level = 'info') {
      isDebugEnabled = enabled;
      logLevel = level;
    }
  
    return {
      Debug: (message, level) => Debug(isDebugEnabled, message, level),
      setDebug,
    };
  }
  
/**
 * Is a singleton so logs and debugging can be enabled or disabled globally.
 */
  const debugLib = createDebugLib();


  
export default debugLib