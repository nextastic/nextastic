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


  /* === schema: foo === */

  export namespace foo {
  
    /* --- enums --- */
    /* (none) */
  
    /* --- tables --- */
    /* (none) */
  
    /* --- aggregate types --- */
  
    // `never` rather than `any` types would be more accurate in this no-tables case, but they stop `shortcuts.ts` compiling
  
    export type Table = never;
    export type Selectable = never;
    export type JSONSelectable = never;
    export type Whereable = never;
    export type Insertable = never;
    export type Updatable = never;
    export type UniqueIndex = never;
    export type Column = never;
  
    export type AllBaseTables = [];
    export type AllForeignTables = [];
    export type AllViews = [];
    export type AllMaterializedViews = [];
    export type AllTablesAndViews = [];
  }


  /* === schema: bar === */

  export namespace bar {
  
    /* --- enums --- */
    /* (none) */
  
    /* --- tables --- */
    /* (none) */
  
    /* --- aggregate types --- */
  
    // `never` rather than `any` types would be more accurate in this no-tables case, but they stop `shortcuts.ts` compiling
  
    export type Table = never;
    export type Selectable = never;
    export type JSONSelectable = never;
    export type Whereable = never;
    export type Insertable = never;
    export type Updatable = never;
    export type UniqueIndex = never;
    export type Column = never;
  
    export type AllBaseTables = [];
    export type AllForeignTables = [];
    export type AllViews = [];
    export type AllMaterializedViews = [];
    export type AllTablesAndViews = [];
  }


  /* === global aggregate types === */

  export type Schema = 'foo' | 'bar';
  export type Table = foo.Table | bar.Table;
  export type Selectable = foo.Selectable | bar.Selectable;
  export type JSONSelectable = foo.JSONSelectable | bar.JSONSelectable;
  export type Whereable = foo.Whereable | bar.Whereable;
  export type Insertable = foo.Insertable | bar.Insertable;
  export type Updatable = foo.Updatable | bar.Updatable;
  export type UniqueIndex = foo.UniqueIndex | bar.UniqueIndex;
  export type Column = foo.Column | bar.Column;

  export type AllSchemas = ['foo', 'bar'];
  export type AllBaseTables = [...foo.AllBaseTables, ...bar.AllBaseTables];
  export type AllForeignTables = [...foo.AllForeignTables, ...bar.AllForeignTables];
  export type AllViews = [...foo.AllViews, ...bar.AllViews];
  export type AllMaterializedViews = [...foo.AllMaterializedViews, ...bar.AllMaterializedViews];
  export type AllTablesAndViews = [...foo.AllTablesAndViews, ...bar.AllTablesAndViews];


  /* === lookups === */

  export type SelectableForTable<T extends Table> = any;

  export type JSONSelectableForTable<T extends Table> = any;

  export type WhereableForTable<T extends Table> = any;

  export type InsertableForTable<T extends Table> = any;

  export type UpdatableForTable<T extends Table> = any;

  export type UniqueIndexForTable<T extends Table> = any;

  export type ColumnForTable<T extends Table> = any;

  export type SQLForTable<T extends Table> = any;

}
