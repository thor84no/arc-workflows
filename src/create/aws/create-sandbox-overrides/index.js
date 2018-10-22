const assert = require('@smallwins/validate/assert');
const mkdir = require('mkdirp');
const path = require('path');
const exists = require('path-exists').sync;
const fs = require('node-fs-extra');
const print = require('../../_print');

const templateDirectory = ''; // TODO

module.exports = (parameters, callback) => {
    console.log('THORDEBUG::@sandbox called');
    assert(parameters, {
        app: String
    });

    const sandbox = path.join(process.cwd(), 'src', 'sandbox');
    mkdir(sandbox, (error) => {
        if (error) {
            return callback(error);
        }
        if (!exists(sandbox)) {
            print.create('@sandbox', 'src/sandbox');
            return fs.copy(templateDirectory, sandbox, callback);
        } else {
            print.skip('@sandbox');
        }
        callback();
    });
};
