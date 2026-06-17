const syncManifestVersion = `node -e ${JSON.stringify(`
const fs = require('node:fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const manifestPath = 'src/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.version = packageJson.version;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\\n');
`)}`;

module.exports = {
  git: {
    commitMessage: "chore: release EZE3 v${version}",
    tagName: "v${version}",
  },
  github: {
    assets: ["dist/EZE3.zip"],
    autoGenerate: true,
    draft: true,
    release: true,
    releaseName: "EZE3 v${version}",
  },
  hooks: {
    "after:bump": syncManifestVersion,
    "before:git:release": "git add src/manifest.json",
    "before:github:release": "npm run build",
  },
  npm: false,
};
