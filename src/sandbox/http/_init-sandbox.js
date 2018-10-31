const path = require('path');
const sandbox = require(path.join(process.cwd(), 'src', 'sandbox'));

const init = typeof sandbox === 'object' ? sandbox.init : () => {};

module.exports = (app, api, type, sandbox) => {
    if (sandbox !== undefined) {
        sandbox = sandbox.reduce((object, parameter) => {
            if (parameter && parameter.includes('=')) {
                const [key, value] = parameter.split('=').map(string => string.trim());
                return Object.assign({
                    [key]: value
                }, object);
            }
            return object;
        }, {});
        init(app, sandbox);
    }
};
