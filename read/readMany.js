const fs = require("node:fs/promises");
(async () => {
  console.time("time");
  const ReadfileHandler = await fs.open("src.txt", "r");
  const WritefileHandler = await fs.open("dest.txt", "w");
  const readStream = ReadfileHandler.createReadStream();
  const writeStream = WritefileHandler.createWriteStream();
  let split = "";
  readStream.on("data", (chunk) => {
    const numbers = chunk.toString().trim().split("  ");
    if (+numbers[0] !== +numbers[1] - 1) {
      if (split) {
        numbers[0] = split + numbers[0];
      }
    }
    if (+numbers[numbers.length - 2] !== +numbers[numbers.length - 1] + 1) {
      split = numbers.pop();
    }

    for (let n = 0; n < numbers.length; n++) {
      let num = +numbers[n];
      if (num % 2 === 0) {
        if (!writeStream.write(" " + num + " ")) {
          readStream.pause();
        }
      }
    }
  });
  writeStream.on("drain", () => {
    readStream.resume();
  });
  readStream.on("end", () => {
    console.log("Ended!");
    console.timeEnd("time");
  });
})();
