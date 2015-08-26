var program = require('commander');
var pkg = require('../package.json');
var cpwanted = require('./');

program
  .version(pkg.version)
  .option('save', 'Save Wanted list')
  .option('list', 'Output Wanted list')
  .option('titles', 'Output Wanted list - titles only')
  .option('upload', 'Upload saved Wanted list to server')
  .parse(process.argv);

if (program.list) {
  cpwanted.list();
} else if (program.save) {
  cpwanted.save();
} else if (program.titles) {
  cpwanted.titles();
} else if (program.upload) {
  cpwanted.upload();
}
