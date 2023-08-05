import { AsyncDatabase } from "promised-sqlite3";

const getDB = (() => {
    let db;

    return async () => {
        if ( ! db ) db = await AsyncDatabase.open("db.db");
        return db;
    }
})();

export { getDB };