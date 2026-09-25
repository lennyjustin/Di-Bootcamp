JavaScript
const { addDays, format } = require('date-fns');

function performDateOperations() {
  const currentDate = new Date();
  const futureDate = addDays(currentDate, 5);
  const formattedDate = format(futureDate, 'yyyy-MM-dd HH:mm:ss');

  console.log(`Current Date: ${currentDate}`);
  console.log(`Date after 5 days (formatted): ${formattedDate}`);
}

module.exports = performDateOperations;