const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replaceInFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/Veloc/g, 'Little Seeds');
  newContent = newContent.replace(/veloc/gi, (match) => {
    if (match === 'veloc') return 'littleseeds';
    if (match === 'VELOC') return 'LITTLE SEEDS';
    if (match === 'Veloc') return 'Little Seeds';
    return match;
  });
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
};

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return;
      }
    }
  });
  return filelist;
};

const files = walkSync(directoryPath);
files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    replaceInFile(file);
  }
});
