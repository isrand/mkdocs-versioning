// Export VERISON=bla
const fs = require('fs');
const {exec} = require("child_process");
const version = process.argv[2];
console.log(version);

const repositoryPath = process.cwd();
const pathToMkDocsFolder = `${repositoryPath}/mkdocs`;
const pathToSiteDocsFolder = `${pathToMkDocsFolder}/site`;
const pathToVersionSelectorDocsFolder = `${pathToMkDocsFolder}/version-selector`;

const pathToVersionFile = `${pathToMkDocsFolder}/versions.json`;

if (!fs.existsSync('./docs')) {
  fs.mkdirSync('./docs');
}

function addNewVersionToList() {
  if (!fs.existsSync(pathToVersionFile)) {
    const versionsObject = {
      versions: [`${version}`]
    };

    fs.writeFileSync(pathToVersionFile, JSON.stringify(versionsObject));
  } else {
    const versionsObjectFileContents = fs.readFileSync(pathToVersionFile).toString();
    const versionsObject = JSON.parse(versionsObjectFileContents);

    if (versionsObject.versions.indexOf(`${version}`) === -1) {
      versionsObject.versions.push(`${version}`);
    }

    versionsObject.versions.sort().reverse();
    fs.writeFileSync(pathToVersionFile, JSON.stringify(versionsObject));
  }
}

function replaceReleases() {
  let versionSelectorIndexMDFileContents = fs.readFileSync(`${pathToVersionSelectorDocsFolder}/docs/index-releases.md`).toString();

  let finalReleases = '';
  const versions = getReleasesFromVersionFile();

  for (const version of versions) {
    if (versions.indexOf(version) < versions.length - 1) {
      finalReleases += `[${version}](./${version}), `;
    } else {
      finalReleases += `[${version}](./${version}).`;
    }
  }

  versionSelectorIndexMDFileContents = versionSelectorIndexMDFileContents.replace('{{releases}}', `## Releases\n\n${finalReleases}`);
  fs.writeFileSync(`${pathToVersionSelectorDocsFolder}/docs/index.md`, versionSelectorIndexMDFileContents);
}

function getReleasesFromVersionFile() {
  const versionsObjectFileContents = fs.readFileSync(pathToVersionFile).toString();
  const versionsObject = JSON.parse(versionsObjectFileContents);

  return versionsObject.versions;
}

function buildNewSite() {
  exec(`mkdocs build -d ../../tmp/${version}`, {cwd: pathToSiteDocsFolder});
}

function buildVersionSelectorSite() {
  exec(`mkdocs build -d ../../tmp/selector`, {cwd: pathToVersionSelectorDocsFolder});
}

function copyFolders() {
  process.chdir(repositoryPath);
  exec(`cp -R ./tmp/${version} ./docs/`);
  exec(`cp -R ./tmp/selector/* ./docs/`);
}

function cleanUp() {
  process.chdir(repositoryPath);
  exec('rm -rf ./tmp');
  exec('rm -rf ./docs/index-releases');
}

addNewVersionToList();
replaceReleases();
buildVersionSelectorSite();
buildNewSite();
setTimeout(() => { copyFolders();}, 5000);
setTimeout(() => { cleanUp();}, 10000);
