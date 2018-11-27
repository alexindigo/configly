var moment = require('moment');

var datetime = moment.utc('2016-01-01T00:00:00');
var date = new Date('Fri Jan 01 2016 00:00:00 GMT-0800');
var combinedDate = new Date('Thu Dec 31 2015 16:00:00 GMT-0800');

module.exports = {
  'stuff': {
    'datetime': datetime,
    'datetime_as_string': datetime.toString(),

    'date': date,
    'date_as_string': date.toString(),

    'combined_datetime': combinedDate,
    'combined_datetime_as_string': combinedDate.toString()
  }
};
