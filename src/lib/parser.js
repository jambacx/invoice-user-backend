const parser = async (str) => {
  const splited = str.split("\n");
  const json = {};

  const promise = splited.map(el => {
    const arr = el.split('：');
    const key = arr[0];
    const value = arr[1];

    if (typeof json[key] === "undefined") {
      json[key] = value;
    } else if (typeof json[key] === "object") {
      json[key].push(value);
    } else {
      const firstValue = json[key];
      json[key] = [firstValue, value];
    }
  });

  await Promise.all(promise);

  return json;
};

module.exports = parser;