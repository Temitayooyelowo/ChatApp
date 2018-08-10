function deepCopy (input) {
  return JSON.parse(JSON.stringify(input));
}

module.exports = {
  deepCopy: deepCopy
}
