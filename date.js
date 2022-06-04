exports.currentDay = function () {
  let date = new Date();
  let currentDayIndex = date.getDay();

  let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
};

exports.currentTime = function () {
  let date = new Date();

  var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  var minutes =
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  time = hours + ":" + minutes;
  return time;
};
