import {Repository} from "../index";

export default (db = 'test') => new Repository('mongodb://localhost/'.concat(db));
