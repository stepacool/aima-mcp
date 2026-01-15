import { f as createAdapterFactory } from "./index.mjs";
import { h, i } from "./index.mjs";
import { s as sql } from "../_libs/kysely.mjs";
import "../_libs/@tanstack/history.mjs";
import "../_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/@tanstack/store.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/react.mjs";
import "../_libs/@apm-js-collab/code-transformer.mjs";
import "../_libs/@tanstack/react-router.mjs";
import "../_libs/tiny-warning.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/@tanstack/react-store.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/@better-auth/utils.mjs";
import "../_libs/better-call.mjs";
import "../_libs/zod.mjs";
import "../_libs/@noble/hashes.mjs";
import "../_libs/@noble/ciphers.mjs";
import "../_libs/@better-fetch/fetch.mjs";
import "../_libs/jose.mjs";
import "../_libs/defu.mjs";
import "../_libs/@t3-oss/env-core.mjs";
import "../_libs/drizzle-orm.mjs";
import "../_libs/pg.mjs";
import "events";
import "../_libs/pg-types.mjs";
import "../_libs/postgres-array.mjs";
import "../_libs/postgres-date.mjs";
import "../_libs/postgres-interval.mjs";
import "../_libs/xtend.mjs";
import "../_libs/postgres-bytea.mjs";
import "../_libs/pg-int8.mjs";
import "dns";
import "../_libs/pg-connection-string.mjs";
import "fs";
import "../_libs/pg-protocol.mjs";
import "net";
import "tls";
import "../_libs/pg-cloudflare.mjs";
import "../_libs/pgpass.mjs";
import "path";
import "../_libs/split2.mjs";
import "string_decoder";
import "../_libs/pg-pool.mjs";
const kyselyAdapter = (db, config) => {
  let lazyOptions = null;
  const createCustomAdapter = (db$1) => {
    return ({ getFieldName, schema, getDefaultFieldName, getDefaultModelName, getFieldAttributes, getModelName }) => {
      const selectAllJoins = (join) => {
        const allSelects = [];
        const allSelectsStr = [];
        if (join) for (const [joinModel, _] of Object.entries(join)) {
          const fields = schema[getDefaultModelName(joinModel)]?.fields;
          const [_joinModelSchema, joinModelName] = joinModel.includes(".") ? joinModel.split(".") : [void 0, joinModel];
          if (!fields) continue;
          fields.id = { type: "string" };
          for (const [field, fieldAttr] of Object.entries(fields)) {
            allSelects.push(sql`${sql.ref(`join_${joinModelName}`)}.${sql.ref(fieldAttr.fieldName || field)} as ${sql.ref(`_joined_${joinModelName}_${fieldAttr.fieldName || field}`)}`);
            allSelectsStr.push({
              joinModel,
              joinModelRef: joinModelName,
              fieldName: fieldAttr.fieldName || field
            });
          }
        }
        return {
          allSelectsStr,
          allSelects
        };
      };
      const withReturning = async (values, builder, model, where) => {
        let res;
        if (config?.type === "mysql") {
          await builder.execute();
          const field = values.id ? "id" : where.length > 0 && where[0]?.field ? where[0].field : "id";
          if (!values.id && where.length === 0) {
            res = await db$1.selectFrom(model).selectAll().orderBy(getFieldName({
              model,
              field
            }), "desc").limit(1).executeTakeFirst();
            return res;
          }
          const value = values[field] || where[0]?.value;
          res = await db$1.selectFrom(model).selectAll().orderBy(getFieldName({
            model,
            field
          }), "desc").where(getFieldName({
            model,
            field
          }), "=", value).limit(1).executeTakeFirst();
          return res;
        }
        if (config?.type === "mssql") {
          res = await builder.outputAll("inserted").executeTakeFirst();
          return res;
        }
        res = await builder.returningAll().executeTakeFirst();
        return res;
      };
      function convertWhereClause(model, w) {
        if (!w) return {
          and: null,
          or: null
        };
        const conditions = {
          and: [],
          or: []
        };
        w.forEach((condition) => {
          let { field: _field, value: _value, operator = "=", connector = "AND" } = condition;
          let value = _value;
          let field = getFieldName({
            model,
            field: _field
          });
          const expr = (eb) => {
            const f = `${model}.${field}`;
            if (operator.toLowerCase() === "in") return eb(f, "in", Array.isArray(value) ? value : [value]);
            if (operator.toLowerCase() === "not_in") return eb(f, "not in", Array.isArray(value) ? value : [value]);
            if (operator === "contains") return eb(f, "like", `%${value}%`);
            if (operator === "starts_with") return eb(f, "like", `${value}%`);
            if (operator === "ends_with") return eb(f, "like", `%${value}`);
            if (operator === "eq") return eb(f, "=", value);
            if (operator === "ne") return eb(f, "<>", value);
            if (operator === "gt") return eb(f, ">", value);
            if (operator === "gte") return eb(f, ">=", value);
            if (operator === "lt") return eb(f, "<", value);
            if (operator === "lte") return eb(f, "<=", value);
            return eb(f, operator, value);
          };
          if (connector === "OR") conditions.or.push(expr);
          else conditions.and.push(expr);
        });
        return {
          and: conditions.and.length ? conditions.and : null,
          or: conditions.or.length ? conditions.or : null
        };
      }
      function processJoinedResults(rows, joinConfig, allSelectsStr) {
        if (!joinConfig || !rows.length) return rows;
        const groupedByMainId = /* @__PURE__ */ new Map();
        for (const currentRow of rows) {
          const mainModelFields = {};
          const joinedModelFields = {};
          for (const [joinModel] of Object.entries(joinConfig)) joinedModelFields[getModelName(joinModel)] = {};
          for (const [key, value] of Object.entries(currentRow)) {
            const keyStr = String(key);
            let assigned = false;
            for (const { joinModel, fieldName, joinModelRef } of allSelectsStr) if (keyStr === `_joined_${joinModelRef}_${fieldName}`) {
              joinedModelFields[getModelName(joinModel)][getFieldName({
                model: joinModel,
                field: fieldName
              })] = value;
              assigned = true;
              break;
            }
            if (!assigned) mainModelFields[key] = value;
          }
          const mainId = mainModelFields.id;
          if (!mainId) continue;
          if (!groupedByMainId.has(mainId)) {
            const entry$1 = { ...mainModelFields };
            for (const [joinModel, joinAttr] of Object.entries(joinConfig)) entry$1[getModelName(joinModel)] = joinAttr.relation === "one-to-one" ? null : [];
            groupedByMainId.set(mainId, entry$1);
          }
          const entry = groupedByMainId.get(mainId);
          for (const [joinModel, joinAttr] of Object.entries(joinConfig)) {
            const isUnique = joinAttr.relation === "one-to-one";
            const limit = joinAttr.limit ?? 100;
            const joinedObj = joinedModelFields[getModelName(joinModel)];
            const hasData = joinedObj && Object.keys(joinedObj).length > 0 && Object.values(joinedObj).some((value) => value !== null && value !== void 0);
            if (isUnique) entry[getModelName(joinModel)] = hasData ? joinedObj : null;
            else {
              const joinModelName = getModelName(joinModel);
              if (Array.isArray(entry[joinModelName]) && hasData) {
                if (entry[joinModelName].length >= limit) continue;
                const idFieldName = getFieldName({
                  model: joinModel,
                  field: "id"
                });
                const joinedId = joinedObj[idFieldName];
                if (joinedId) {
                  if (!entry[joinModelName].some((item) => item[idFieldName] === joinedId) && entry[joinModelName].length < limit) entry[joinModelName].push(joinedObj);
                } else if (entry[joinModelName].length < limit) entry[joinModelName].push(joinedObj);
              }
            }
          }
        }
        let result = Array.from(groupedByMainId.values());
        for (const entry of result) for (const [joinModel, joinAttr] of Object.entries(joinConfig)) if (joinAttr.relation !== "one-to-one") {
          const joinModelName = getModelName(joinModel);
          if (Array.isArray(entry[joinModelName])) {
            const limit = joinAttr.limit ?? 100;
            if (entry[joinModelName].length > limit) entry[joinModelName] = entry[joinModelName].slice(0, limit);
          }
        }
        return result;
      }
      return {
        async create({ data, model }) {
          return await withReturning(data, db$1.insertInto(model).values(data), model, []);
        },
        async findOne({ model, where, select, join }) {
          const { and, or } = convertWhereClause(model, where);
          let query = db$1.selectFrom((eb) => {
            let b = eb.selectFrom(model);
            if (and) b = b.where((eb$1) => eb$1.and(and.map((expr) => expr(eb$1))));
            if (or) b = b.where((eb$1) => eb$1.or(or.map((expr) => expr(eb$1))));
            return b.selectAll().as("primary");
          }).selectAll("primary");
          if (join) for (const [joinModel, joinAttr] of Object.entries(join)) {
            const [_joinModelSchema, joinModelName] = joinModel.includes(".") ? joinModel.split(".") : [void 0, joinModel];
            query = query.leftJoin(`${joinModel} as join_${joinModelName}`, (join$1) => join$1.onRef(`join_${joinModelName}.${joinAttr.on.to}`, "=", `primary.${joinAttr.on.from}`));
          }
          const { allSelectsStr, allSelects } = selectAllJoins(join);
          query = query.select(allSelects);
          const res = await query.execute();
          if (!res || !Array.isArray(res) || res.length === 0) return null;
          const row = res[0];
          if (join) return processJoinedResults(res, join, allSelectsStr)[0];
          return row;
        },
        async findMany({ model, where, limit, offset, sortBy, join }) {
          const { and, or } = convertWhereClause(model, where);
          let query = db$1.selectFrom((eb) => {
            let b = eb.selectFrom(model);
            if (config?.type === "mssql") {
              if (offset !== void 0) {
                if (!sortBy) b = b.orderBy(getFieldName({
                  model,
                  field: "id"
                }));
                b = b.offset(offset).fetch(limit || 100);
              } else if (limit !== void 0) b = b.top(limit);
            } else {
              if (limit !== void 0) b = b.limit(limit);
              if (offset !== void 0) b = b.offset(offset);
            }
            if (sortBy?.field) b = b.orderBy(`${getFieldName({
              model,
              field: sortBy.field
            })}`, sortBy.direction);
            if (and) b = b.where((eb$1) => eb$1.and(and.map((expr) => expr(eb$1))));
            if (or) b = b.where((eb$1) => eb$1.or(or.map((expr) => expr(eb$1))));
            return b.selectAll().as("primary");
          }).selectAll("primary");
          if (join) for (const [joinModel, joinAttr] of Object.entries(join)) {
            const [_joinModelSchema, joinModelName] = joinModel.includes(".") ? joinModel.split(".") : [void 0, joinModel];
            query = query.leftJoin(`${joinModel} as join_${joinModelName}`, (join$1) => join$1.onRef(`join_${joinModelName}.${joinAttr.on.to}`, "=", `primary.${joinAttr.on.from}`));
          }
          const { allSelectsStr, allSelects } = selectAllJoins(join);
          query = query.select(allSelects);
          if (sortBy?.field) query = query.orderBy(`${getFieldName({
            model,
            field: sortBy.field
          })}`, sortBy.direction);
          const res = await query.execute();
          if (!res) return [];
          if (join) return processJoinedResults(res, join, allSelectsStr);
          return res;
        },
        async update({ model, where, update: values }) {
          const { and, or } = convertWhereClause(model, where);
          let query = db$1.updateTable(model).set(values);
          if (and) query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          if (or) query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          return await withReturning(values, query, model, where);
        },
        async updateMany({ model, where, update: values }) {
          const { and, or } = convertWhereClause(model, where);
          let query = db$1.updateTable(model).set(values);
          if (and) query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          if (or) query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          const res = (await query.executeTakeFirst()).numUpdatedRows;
          return res > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : Number(res);
        },
        async count({ model, where }) {
          const { and, or } = convertWhereClause(model, where);
          let query = db$1.selectFrom(model).select(db$1.fn.count("id").as("count"));
          if (and) query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          if (or) query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          const res = await query.execute();
          if (typeof res[0].count === "number") return res[0].count;
          if (typeof res[0].count === "bigint") return Number(res[0].count);
          return parseInt(res[0].count);
        },
        async delete({ model, where }) {
          const { and, or } = convertWhereClause(model, where);
          let query = db$1.deleteFrom(model);
          if (and) query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          if (or) query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          await query.execute();
        },
        async deleteMany({ model, where }) {
          const { and, or } = convertWhereClause(model, where);
          let query = db$1.deleteFrom(model);
          if (and) query = query.where((eb) => eb.and(and.map((expr) => expr(eb))));
          if (or) query = query.where((eb) => eb.or(or.map((expr) => expr(eb))));
          const res = (await query.executeTakeFirst()).numDeletedRows;
          return res > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : Number(res);
        },
        options: config
      };
    };
  };
  let adapterOptions = null;
  adapterOptions = {
    config: {
      adapterId: "kysely",
      adapterName: "Kysely Adapter",
      usePlural: config?.usePlural,
      debugLogs: config?.debugLogs,
      supportsBooleans: config?.type === "sqlite" || config?.type === "mssql" || config?.type === "mysql" || !config?.type ? false : true,
      supportsDates: config?.type === "sqlite" || config?.type === "mssql" || !config?.type ? false : true,
      supportsJSON: config?.type === "postgres" ? true : false,
      supportsArrays: false,
      supportsUUIDs: config?.type === "postgres" ? true : false,
      transaction: config?.transaction ? (cb) => db.transaction().execute((trx) => {
        return cb(createAdapterFactory({
          config: adapterOptions.config,
          adapter: createCustomAdapter(trx)
        })(lazyOptions));
      }) : false
    },
    adapter: createCustomAdapter(db)
  };
  const adapter = createAdapterFactory(adapterOptions);
  return (options) => {
    lazyOptions = options;
    return adapter(options);
  };
};
export {
  h as createKyselyAdapter,
  i as getKyselyDatabaseType,
  kyselyAdapter
};
