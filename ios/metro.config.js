// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require('path')
// /** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)


const extraNodeModules = {
    'modules': path.resolve(path.join(__dirname, '../shared'))
};
const nodeModulesPaths = [path.resolve(path.join(__dirname, './node_modules'))];


config.resolver = {
    extraNodeModules,
    nodeModulesPaths
}
const watchFolders = [
    path.resolve(path.join(__dirname, '../shared'))
];

config.watchFolders = watchFolders

// /** @type {import('expo/metro-config').MetroConfig} */
// const config = getDefaultConfig(__dirname, {
//   // [Web-only]: Enables CSS support in Metro.
//   isCSSEnabled: true,
// });

module.exports = config;

// const path = require('path');

// const extraNodeModules = {
//     'modules': path.resolve(path.join(__dirname, '../shared'))
// };

// const watchFolders = [
//     path.resolve(path.join(__dirname, '../shared'))
// ];

// const nodeModulesPaths = [path.resolve(path.join(__dirname, './node_modules'))];

// module.exports = {
//     transformer: {
//         getTransformOptions: async () => ({
//             transform: {
//                 experimentalImportSupport: true,
//                 inlineRequires: true,
//             },
//         }),
//     },
//     resolver: {
//         extraNodeModules,
//         nodeModulesPaths
//     },
//     watchFolders
// };