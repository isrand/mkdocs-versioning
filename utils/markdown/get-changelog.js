const mdit = require('markdown-it');
const fs = require('fs');
const td = require('turndown');

const turndownService = new td();
const md = new mdit();
const renderer = new mdit().renderer;

const markdownFileContents = fs.readFileSync('./CHANGELOG.md').toString();
const result = md.parse(markdownFileContents);

const version = String(process.argv[2]);
const contents = [];
let push = false;
let previous = '';

for (const token of result) {
  if (token.type === 'heading_open' && token.markup === '##') {
    if (result[result.indexOf(token) + 1].content === version) {
      contents.push(token);
      push = true;
    } else {
      previous = result[result.indexOf(token) + 1].content;
      break;
    }
  }
  if (push) {
    contents.push(token);
  }
}

const rendered = renderer.render(contents, {});
let markdown = turndownService.turndown(rendered);
if (markdown.length === 0) {
  throw new Error('Version not found in the CHANGELOG.md file');
}

if (previous !== '') {
  markdown += `

Full Changelog: https://github.com/isrand/mkdocs-versioning/compare/${previous}...${version}`;
}



fs.writeFileSync(`./CHANGELOG_${version}.md`, markdown);
