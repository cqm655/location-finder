import { Connection, Request, TYPES } from 'tedious';
import * as dotenv from 'dotenv';

dotenv.config();

class Database {
  private connection: Connection;

  constructor() {
    const userName = process.env.USER;
    const password = process.env.PASSWORD;
    const server = process.env.SERVER;
    const database = process.env.DATABASE;

    if (!userName || !password || !server || !database) {
      throw new Error('Missing environment variables');
    }

    const config = {
      server: server,
      authentication: {
        type: 'default' as const,
        options: {
          userName: userName,
          password: password,
        },
      },
      options: {
        port: 50389,
        database: database,
        requestTimeout: 0,
        encrypt: true,
        trustServerCertificate: true,
      },
    };

    this.connection = new Connection(config);
  }

  public executeQuery(
    query: string,
    parameters: any[] = [],
    isStoredProcedure: boolean = false,
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];

      let sqlQuery = query;

      if (isStoredProcedure) {
        sqlQuery = `EXEC ${query}`;
      }

      const request = new Request(sqlQuery, (err) => {
        this.connection.close();
        if (err) return reject(err);
      });

      parameters.forEach((param) => {
        request.addParameter(param.name, param.type, param.value);
      });

      request.on('row', (columns) => {
        const entry: { [key: string]: any } = {};
        columns.forEach((column) => {
          entry[column.metadata.colName] = column.value;
        });
        results.push(entry);
      });

      request.on('requestCompleted', () => {
        this.connection.close();
        resolve(results);
      });

      request.on('error', (err) => {
        this.connection.close();
        reject(err);
      });

      this.connection.execSql(request);
    });
  }

  public executeProcedure(
    procName: string,
    parameters: any[] = [],
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];

      const request = new Request(procName, (err) => {
        if (err) return reject(err);
      });

      parameters.forEach((param) => {
        request.addParameter(param.name, param.type, param.value);
      });

      request.on('row', (columns) => {
        const entry: { [key: string]: any } = {};
        columns.forEach((column) => {
          entry[column.metadata.colName] = column.value;
        });
        results.push(entry);
      });

      request.on('requestCompleted', () => {
        resolve(results);
      });

      request.on('error', (err) => reject(err));

      // 🔑 Asta e diferența: pentru SP, folosești callProcedure
      this.connection.callProcedure(request);
    });
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  public close(): void {
    this.connection.close();
  }
}

export default Database;
