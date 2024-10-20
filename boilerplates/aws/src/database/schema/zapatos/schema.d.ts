/*
** DON'T EDIT THIS FILE **
It's been generated by Zapatos, and is liable to be overwritten

Zapatos: https://jawj.github.io/zapatos/
Copyright (C) 2020 - 2023 George MacKerron
Released under the MIT licence: see LICENCE file
*/

declare module 'zapatos/schema' {

  import type * as db from 'zapatos/db';

  // got a type error on schemaVersionCanary below? update by running `npx zapatos`
  export interface schemaVersionCanary extends db.SchemaVersionCanary { version: 104 }


  /* === schema: myapp === */

  export namespace myapp {
  
    /* --- enums --- */
    /* (none) */
  
    /* --- tables --- */
  
    /**
     * **myapp.users**
     * - Table in database
     */
    export namespace users {
      export type Table = 'myapp.users';
      export interface Selectable {
        /**
        * **myapp.users.created_at**
        * - `timestamptz` in database
        * - `NOT NULL`, default: `CURRENT_TIMESTAMP`
        */
        created_at: Date;
        /**
        * **myapp.users.email**
        * - `text` in database
        * - `NOT NULL`, no default
        */
        email: string;
        /**
        * **myapp.users.id**
        * - `int4` in database
        * - `NOT NULL`, default: `nextval('myapp.users_id_seq'::regclass)`
        */
        id: number;
        /**
        * **myapp.users.updated_at**
        * - `timestamptz` in database
        * - `NOT NULL`, default: `CURRENT_TIMESTAMP`
        */
        updated_at: Date;
      }
      export interface JSONSelectable {
        /**
        * **myapp.users.created_at**
        * - `timestamptz` in database
        * - `NOT NULL`, default: `CURRENT_TIMESTAMP`
        */
        created_at: db.TimestampTzString;
        /**
        * **myapp.users.email**
        * - `text` in database
        * - `NOT NULL`, no default
        */
        email: string;
        /**
        * **myapp.users.id**
        * - `int4` in database
        * - `NOT NULL`, default: `nextval('myapp.users_id_seq'::regclass)`
        */
        id: number;
        /**
        * **myapp.users.updated_at**
        * - `timestamptz` in database
        * - `NOT NULL`, default: `CURRENT_TIMESTAMP`
        */
        updated_at: db.TimestampTzString;
      }
      export interface Whereable {
        /**
        * **myapp.users.created_at**
        * - `timestamptz` in database
        * - `NOT NULL`, default: `CURRENT_TIMESTAMP`
        */
        created_at?: (db.TimestampTzString | Date) | db.Parameter<(db.TimestampTzString | Date)> | db.SQLFragment | db.ParentColumn | db.SQLFragment<any, (db.TimestampTzString | Date) | db.Parameter<(db.TimestampTzString | Date)> | db.SQLFragment | db.ParentColumn>;
        /**
        * **myapp.users.email**
        * - `text` in database
        * - `NOT NULL`, no default
        */
        email?: string | db.Parameter<string> | db.SQLFragment | db.ParentColumn | db.SQLFragment<any, string | db.Parameter<string> | db.SQLFragment | db.ParentColumn>;
        /**
        * **myapp.users.id**
        * - `int4` in database
        * - `NOT NULL`, default: `nextval('myapp.users_id_seq'::regclass)`
        */
        id?: number | db.Parameter<number> | db.SQLFragment | db.ParentColumn | db.SQLFragment<any, number | db.Parameter<number> | db.SQLFragment | db.ParentColumn>;
        /**
        * **myapp.users.updated_at**
        * - `timestamptz` in database
        * - `NOT NULL`, default: `CURRENT_TIMESTAMP`
        */
        updated_at?: (db.TimestampTzString | Date) | db.Parameter<(db.TimestampTzString | Date)> | db.SQLFragment | db.ParentColumn | db.SQLFragment<any, (db.TimestampTzString | Date) | db.Parameter<(db.TimestampTzString | Date)> | db.SQLFragment | db.ParentColumn>;
      }
      export interface Insertable {
        /**
        * **myapp.users.created_at**
        * - `timestamptz` in database
        * - `NOT NULL`, default: `CURRENT_TIMESTAMP`
        */
        created_at?: (db.TimestampTzString | Date) | db.Parameter<(db.TimestampTzString | Date)> | db.DefaultType | db.SQLFragment;
        /**
        * **myapp.users.email**
        * - `text` in database
        * - `NOT NULL`, no default
        */
        email: string | db.Parameter<string> | db.SQLFragment;
        /**
        * **myapp.users.id**
        * - `int4` in database
        * - `NOT NULL`, default: `nextval('myapp.users_id_seq'::regclass)`
        */
        id?: number | db.Parameter<number> | db.DefaultType | db.SQLFragment;
        /**
        * **myapp.users.updated_at**
        * - `timestamptz` in database
        * - `NOT NULL`, default: `CURRENT_TIMESTAMP`
        */
        updated_at?: (db.TimestampTzString | Date) | db.Parameter<(db.TimestampTzString | Date)> | db.DefaultType | db.SQLFragment;
      }
      export interface Updatable {
        /**
        * **myapp.users.created_at**
        * - `timestamptz` in database
        * - `NOT NULL`, default: `CURRENT_TIMESTAMP`
        */
        created_at?: (db.TimestampTzString | Date) | db.Parameter<(db.TimestampTzString | Date)> | db.DefaultType | db.SQLFragment | db.SQLFragment<any, (db.TimestampTzString | Date) | db.Parameter<(db.TimestampTzString | Date)> | db.DefaultType | db.SQLFragment>;
        /**
        * **myapp.users.email**
        * - `text` in database
        * - `NOT NULL`, no default
        */
        email?: string | db.Parameter<string> | db.SQLFragment | db.SQLFragment<any, string | db.Parameter<string> | db.SQLFragment>;
        /**
        * **myapp.users.id**
        * - `int4` in database
        * - `NOT NULL`, default: `nextval('myapp.users_id_seq'::regclass)`
        */
        id?: number | db.Parameter<number> | db.DefaultType | db.SQLFragment | db.SQLFragment<any, number | db.Parameter<number> | db.DefaultType | db.SQLFragment>;
        /**
        * **myapp.users.updated_at**
        * - `timestamptz` in database
        * - `NOT NULL`, default: `CURRENT_TIMESTAMP`
        */
        updated_at?: (db.TimestampTzString | Date) | db.Parameter<(db.TimestampTzString | Date)> | db.DefaultType | db.SQLFragment | db.SQLFragment<any, (db.TimestampTzString | Date) | db.Parameter<(db.TimestampTzString | Date)> | db.DefaultType | db.SQLFragment>;
      }
      export type UniqueIndex = 'users_pkey';
      export type Column = keyof Selectable;
      export type OnlyCols<T extends readonly Column[]> = Pick<Selectable, T[number]>;
      export type SQLExpression = Table | db.ColumnNames<Updatable | (keyof Updatable)[]> | db.ColumnValues<Updatable> | Whereable | Column | db.ParentColumn | db.GenericSQLExpression;
      export type SQL = SQLExpression | SQLExpression[];
    }
  
    /* --- aggregate types --- */
  
    export type Table = users.Table;
    export type Selectable = users.Selectable;
    export type JSONSelectable = users.JSONSelectable;
    export type Whereable = users.Whereable;
    export type Insertable = users.Insertable;
    export type Updatable = users.Updatable;
    export type UniqueIndex = users.UniqueIndex;
    export type Column = users.Column;
  
    export type AllBaseTables = [users.Table];
    export type AllForeignTables = [];
    export type AllViews = [];
    export type AllMaterializedViews = [];
    export type AllTablesAndViews = [users.Table];
  }


  /* === global aggregate types === */

  export type Schema = 'myapp';
  export type Table = myapp.Table;
  export type Selectable = myapp.Selectable;
  export type JSONSelectable = myapp.JSONSelectable;
  export type Whereable = myapp.Whereable;
  export type Insertable = myapp.Insertable;
  export type Updatable = myapp.Updatable;
  export type UniqueIndex = myapp.UniqueIndex;
  export type Column = myapp.Column;

  export type AllSchemas = ['myapp'];
  export type AllBaseTables = [...myapp.AllBaseTables];
  export type AllForeignTables = [...myapp.AllForeignTables];
  export type AllViews = [...myapp.AllViews];
  export type AllMaterializedViews = [...myapp.AllMaterializedViews];
  export type AllTablesAndViews = [...myapp.AllTablesAndViews];


  /* === lookups === */

  export type SelectableForTable<T extends Table> = {
    "myapp.users": myapp.users.Selectable;
  }[T];

  export type JSONSelectableForTable<T extends Table> = {
    "myapp.users": myapp.users.JSONSelectable;
  }[T];

  export type WhereableForTable<T extends Table> = {
    "myapp.users": myapp.users.Whereable;
  }[T];

  export type InsertableForTable<T extends Table> = {
    "myapp.users": myapp.users.Insertable;
  }[T];

  export type UpdatableForTable<T extends Table> = {
    "myapp.users": myapp.users.Updatable;
  }[T];

  export type UniqueIndexForTable<T extends Table> = {
    "myapp.users": myapp.users.UniqueIndex;
  }[T];

  export type ColumnForTable<T extends Table> = {
    "myapp.users": myapp.users.Column;
  }[T];

  export type SQLForTable<T extends Table> = {
    "myapp.users": myapp.users.SQL;
  }[T];

}
