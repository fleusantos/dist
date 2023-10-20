const fs = require("fs");
const path = require("path");

// this function is used only on aws beanstalk
// locally we will use gitInfoLocal.js
const main = () => {
  try {
    const versionFilePath = path.resolve(__dirname, "../../version.txt");
    const gitCommitHash = fs.readFileSync(versionFilePath, "utf8");

    const obj = {
      gitBranch: "HEAD",
      gitCommitHash: gitCommitHash.substring(0, 7),
    };

    const gitInfoFilePath = path.resolve(__dirname, "../../gitInfo.json");
    const fileContents = JSON.stringify(obj, null, 2);

    fs.writeFileSync(gitInfoFilePath, fileContents);
  } catch (err) {
    // just swallow error
    console.log(err);
  }
};

main();
