exports.randomInt = (min = 0, max = 10) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.getFrom = (array) => {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
};
