const { Writable } = require("node:stream");
const fs = require("fs");
class FileWriteStream extends Writable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });
    this.fileName = fileName;
    this.fd = null;
    this.chuncks = [];
    this.chuncksSize = 0;
    this.writesCount = 0;
  }

  _construct(callback) {
    fs.open(this.fileName, "w", (err, fd) => {
      if (err) {
        callback(err);
      } else {
        this.fd = fd;
        callback();
      }
    });
  }
  _write(chunck, encoding, callback) {
    this.chuncks.push(chunck);
    this.chuncksSize += chunck.length;
    if (this.chuncksSize > this.writableHighWaterMark) {
      fs.write(this.fd, Buffer.concat(this.chuncks), (err) => {
        if (err) {
          return callback(err);
        }
        this.chuncks = [];
        this.chuncksSize = 0;
        ++this.writesCount;
        callback();
      });
    } else {
      callback();
    }
  }

  _final(callback) {
    fs.write(this.fd, Buffer.concat(this.chuncks), (err) => {
      if (err) return callback(err);

      this.chuncks = [];
      this.chuncksSize = 0;
      ++this.writesCount;
      callback();
    });
  }

  _destroy(error, callback) {
    console.log("Number Of Writes", this.writesCount);
    if (this.fd) {
      fs.close(this.fd, (err) => {
        callback(err || error);
      });
    } else {
      callback(error);
    }
  }
}

(async () => {
  console.time("writeMany");
  const stream = new FileWriteStream({
    fileName: "text.txt",
  });
  let i = 0;
  let NUM_OF_WRITES = 1000000;
  const writeMany = () => {
    while (i < NUM_OF_WRITES) {
      const buff = Buffer.from(` ${i} `, "utf-8");
      if (i === NUM_OF_WRITES - 1) {
        return stream.end(buff);
      }
      if (!stream.write(buff)) break;
      i++;
    }
  };
  writeMany();
  stream.on("drain", () => {
    writeMany();
  });

  stream.on("finish", () => {
    console.timeEnd("writeMany");
  });
})();
