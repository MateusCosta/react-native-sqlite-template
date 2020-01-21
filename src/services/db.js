import SQLite from 'react-native-sqlite-storage';

var db = SQLite.openDatabase({name: 'user.db', createFromLocation: '~user.db'});

export default db;