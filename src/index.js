import Couchpotato from 'couchpotato';
import fs from 'fs';
import path from 'path';
import randomstring from 'randomstring';
import yaml from 'js-yaml';

const ROOT_FOLDER = path.dirname(__dirname);
const DATA_STORE = path.join(ROOT_FOLDER, 'data.json');
const CONFIG = yaml.safeLoad(fs.readFileSync(path.join(ROOT_FOLDER, 'config.yaml'), 'utf8'));

class Movie {
  constructor(data) {
    this.title = data.title;
    this.t = randomstring.generate(8);
    this.identifier = data.identifier || data.identifiers.imdb;
    this.profile_id = data.profile_id;
    this.category_id = data.category_id;
  }

  get encodedData() {
    return `t=${this.t}&identifier=${this.identifier}&title=${encodeURI(this.title)}&profile_id=${this.profile_id}&category_id=${this.category_id}`;
  }
}

class Movies {
  counter = 0;
  cp = new Couchpotato(CONFIG.url, CONFIG.port);
  data = [];
  errors = [];

  lsRemote() {
    this.cp.getKey((res) => {
      if (res) {
        console.log('getting movies list');
        this.cp.query('movie.list', {
            status: 'active'
        }, (success, body) => {
          if (success) {
            console.log('processing results');
            body.movies.forEach((movie) => {
              this.add(movie);
            });
            this.save();
          }
        });
      }
    });
  }

  add(movie) {
    this.data.push(new Movie(movie));
  }

  lsRemoteSave() {
    consolela.log('saving file:', DATA_STORE);
    fs.writeFile(DATA_STORE, JSON.stringify(this.data, null, '  '), 'utf8', () => {
      console.log('save complete');
    });
  }
}

var movies = new Movies();

export default movies;
