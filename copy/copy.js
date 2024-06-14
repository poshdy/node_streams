const fs = require("node:fs/promises");
const { pipeline } = require("node:stream");
(async () => {
  console.time("copy");
  const srcFile = await fs.open("./text-gigantic.txt", "r");
  const destFile = await fs.open("./text-copy.txt", "w");

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();

  pipeline(readStream, writeStream, (err) => {
    if (err) {
      console.log(err);
    }
    console.timeEnd("copy");
  });
})();
