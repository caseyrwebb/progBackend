const express = require("express");
var fs = require("fs");
var parser = require("xml2json");
var cors = require("cors");
var app = express();

app.use(cors());

const PORT = 4000;

app.get("/prog", (req, res) => {
  let prog = [{}];
  fs.readFile("./status.xml", function (err, data) {
    var json = JSON.parse(parser.toJson(data, { reversible: true }));

    //function to iterate through nested obj if key isn't child[0] of root.
    const deepIterate = (obj, searchKey, results = {}) => {
      const r = results;
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (key === searchKey) {
          r[searchKey] = value;
        } else if (typeof value === "object") {
          deepIterate(value, searchKey, r);
        }
      });
      return r[searchKey];
    };

    prog[0].calls = json.Status.Call;
    prog[0].cameras = json.Status.Cameras;
    prog[0].capabilities = json.Status.Capabilities;
    //ContactInfo is nested in obj.
    prog[0].contactInfo = json.Status.ContactInfo
      ? json.Status.ContactInfo
      : deepIterate(json.Status, "ContactInfo");

    prog[0].network = json.Status.Network;
    prog[0].peripherals = json.Status.Peripherals;
    prog[0].systemInfo = json.Status.SystemUnit;

    //SystemTime is nested in obj.
    prog[0].systemTime = json.Status.SystemTime
      ? json.Status.SystemTime
      : deepIterate(json.Status, "SystemTime");

    res.send(prog);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});
