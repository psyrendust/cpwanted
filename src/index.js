import Couchpotato from 'couchpotato';
import fs from 'fs';
import path from 'path';
import pwuid from 'pwuid';
import randomstring from 'randomstring';
import yaml from 'js-yaml';
import Util from './util';
import request from 'superagent';

const PWUID = pwuid();
const ROOT_FOLDER = path.join(PWUID.dir, '.cpwanted');
const DATA_STORE = path.join(ROOT_FOLDER, 'data.json');
const CONFIG = yaml.safeLoad(fs.readFileSync(path.join(ROOT_FOLDER, 'config.yaml'), 'utf8'));

let util = new Util();

class Movie {
  constructor(data) {
    this.title = data.title;
    this.t = randomstring.generate(8);
    this.identifier = data.identifier || data.identifiers.imdb;
    this.profile_id = data.profile_id;
    this.category_id = data.category_id;
  }

  encodedData() {
    return `t=${this.t}&identifier=${this.identifier}&title=${encodeURI(this.title)}&profile_id=${this.profile_id}&category_id=${this.category_id}`;
  }
}

class Movies {
  counter = 0;
  cp = new Couchpotato(CONFIG.url, CONFIG.port);
  data = [];
  errors = [];

  lsRemote(done) {
    this.cp.getKey((res) => {
      if (res) {
        util.verbose('getting movies list');
        this.cp.query('movie.list', {
            status: 'active'
        }, (success, body) => {
          if (success) {
            util.verbose('processing results');
            body.movies.forEach((movie) => {
              this.data.push(new Movie(movie));
            });
            done();
          }
        });
      }
    });
  }

  list() {
    util.setLoglevel(1);
    this.lsRemote(() => {
      util.stringify(this.data);
    });
  }

  titles() {
    util.setLoglevel(1);
    this.lsRemote(() => {
      let data = this.data.map(val => { return val.title });
      util.stringify(data);
      util.log('total movies -', data.length);
    });
  }

  save() {
    util.setLoglevel(0);
    this.lsRemote(() => {
      util.verbose('saving file:', DATA_STORE);
      fs.writeFile(DATA_STORE, JSON.stringify(this.data, null, '  ') + '\n', 'utf8', () => {
        util.verbose('save complete');
      });
    });
  }

  read() {
    let fileData = JSON.parse(fs.readFileSync(DATA_STORE, { encoding: 'utf8' }));
    this.data = [];
    fileData.forEach(movie => {
      this.data.push(new Movie(movie));
    });
  }

  upload() {
    util.setLoglevel(0);
    this.read();
    this.cp.getKey(res => {
      if (res) {
        this.index = 0;
        this.next();
      }
    })
  }

  next() {
    if (this.index < this.data.length) {
      let movie = this.data[this.index++];
      util.verbose('--------------------------------------------------');
      util.verbose('upload movie:', movie.title);
      request
        .post(`${this.cp.serverUrl}/api/${this.cp.key}/movie.add?${movie.encodedData()}`)
        .end((err, res) => {
          if (res) {
            util.verbose('- saved:', movie.title);
            this.next();
          }
        });
    } else {
      util.verbose('--------------------------------------------------');
      console.log('uploaded all movies');
    }
  }
}

var movies = new Movies();
export default movies;
