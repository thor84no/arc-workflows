const assert = require('@smallwins/validate/assert');
const path = require('path');
const exists = require('path-exists');
const fs = require('fs');
const print = require('../../_print');
const promisify = require('util').promisify;
const mkdir = promisify(require('mkdirp'));

fs.copyFile = promisify(fs.copyFile);
fs.readdir = promisify(fs.readdir);
fs.lstat = promisify(fs.lstat);

const templateDirectory = path.join(__dirname, '../../templates/sandbox');

const ignore = () => {};
const unwrapDirectories = file => {
    return fs.lstat(file)
        .then(stats => {
            if (stats.isDirectory()) {
                return getFiles(file);
            } else {
                return file;
            }
        })
        .catch(ignore);
};

const getFiles = directory => {
    return fs.readdir(directory)
        .then(files => Promise.all(
            files.map(file => path.join(directory, file))
                .map(unwrapDirectories))
        )
        .then(files => files.filter(file => typeof file === 'string'))
        .catch(error => console.error(error));
};

const createFromTemplate = newRoot => templateFile => {
    const relativePath = path.relative(templateDirectory, templateFile);
    const newPath = path.join(newRoot, relativePath);
    const directoryToCreate = path.join(newPath, '../');
    return mkdir(directoryToCreate)
        .then(() => {
            exists(newPath).then(exists => {
                if (!exists) {
                    print.create('@sandbox', `src/sandbox/${relativePath}`);
                    return fs.copyFile(templateFile, newPath);
                } else {
                    print.skip('@sandbox', `src/sandbox/${relativePath}`);
                }
            });
        });
};

module.exports = (parameters, callback) => {
    assert(parameters, {
        app: String
    });

    const sandboxParent = path.join(process.cwd(), 'src');
    const sandbox = path.join(sandboxParent, 'sandbox');

    getFiles(templateDirectory)
        .then(files => files.forEach(createFromTemplate(sandbox)))
        .then(callback)
        .catch(callback);
};
