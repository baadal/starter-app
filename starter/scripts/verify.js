"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var package_json_1 = __importDefault(require("../../package.json"));
var logger_1 = __importDefault(require("./logger"));
var reqList = [];
var depsList = __spreadArray(__spreadArray([''], Object.keys(package_json_1.default.devDependencies)), Object.keys(package_json_1.default.dependencies));
var depsFlag = depsList.every(function (dep) {
    try {
        var nodeModulesPath = path_1.default.resolve(process.cwd(), "node_modules/" + dep);
        fs_1.default.readdirSync(nodeModulesPath);
    }
    catch (e) {
        reqList.push(dep);
        if (!dep)
            return false; // node_modules folder not present
    }
    return true;
});
if (reqList.length > 0) {
    if (!depsFlag) {
        logger_1.default.error('No 💩 can happen unless you run:');
        logger_1.default.warn('npm install\n');
    }
    else {
        logger_1.default.error('To err is human.. 🍺');
        logger_1.default.warn("You must install: " + reqList.join(', ') + "\n");
    }
    process.exit(1);
}
