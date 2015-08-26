var babel = require('babel');
var chokidar = require('chokidar');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var mkdirp = require('mkdirp');
var Util = require('../src/util');

var ROOT_PATH = path.dirname(__dirname);
var LIB_PATH = path.join(ROOT_PATH, 'lib');
var SRC_PATH = path.join(ROOT_PATH, 'src');
var util = new Util({
  showDate: true,
  prefix: '[build]'
});

mkdirp.sync(LIB_PATH);

var babelOptions = {
  stage: 0
};

if (process.argv[2] === '--watch') {
  var watcher = chokidar.watch(path.join(SRC_PATH, '/**/*.js'),
    {ignored: /[\/\\]\./}
  );

  watcher
    .on('add', build)
    .on('change', build)
    .on('ready', build);
} else {
  build();
}


function build(filepath) {
  var files;
  if (filepath) {
    files = [filepath];
  } else {
    files = glob.sync(path.join(SRC_PATH, '/**/*.js'));
  }
  var newfilepath = '';

  files
    .filter(function(val) {
      return fs.statSync(val).isFile();
    })
    .forEach(function(val) {
      newfilepath = val.replace(SRC_PATH, LIB_PATH);
      util.log('saved "' + newfilepath + '"');
      fs.writeFileSync(
        newfilepath,
        babel.transformFileSync(val, babelOptions).code
      );
    });
}
