import axios from "axios";

const apiKey = import.meta.env.VITE_VERCEL_AIRTABLE_API_KEY;
const baseKey = import.meta.env.VITE_VERCEL_BASE_KEY;

export const formatRecords = (records = []) => {
  let collection = [].concat(records);

  const format = (record) => {
    if (!record) return {};
    let { id, fields } = record;
    return {
      id,
      ...fields,
    };
  };

  let result =
    collection.length >= 0 ? collection.map(format) : format(collection);

  return result;
};

export const getRecords = async (
  tableName,
  maxRecords = 10,
  pageSize = 10,
  sort = ""
) => {
  console.log("maxRecords", maxRecords);
  console.log("sort", sort);
  const url = `https://api.airtable.com/v0/${baseKey}/${tableName}?maxRecords=${maxRecords}&pageSize=${pageSize}&sort=${sort}`;
  console.log("url", url);
  const result = await axios({
    url,
    headers: {
      "Content-Type": "x-www-form-urlencoded",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  // console.log("result", result);
  let offset = result?.data?.offset || null;
  // console.log("offset", offset);
  // TODO: somehow get this offset back into useTasks() so we can pagify...

  return formatRecords(result?.data?.records);
};

export const searchTable = async (tableName = null, fields = []) => {
  if (!tableName) throw Error(`tableName cannot be null or empty`);
  let url = `https://api.airtable.com/v0/${baseKey}/${tableName}?`;
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (i > 0) {
      url.concat(`&`);
    }
    url.concat(`fields%5B%5D=${field}`);
  }

  console.log("airtable search url :>> ", url);
  const result = await axios({
    url,
    headers: {
      "Content-Type": "x-www-form-urlencoded",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  let raw = formatRecords(result?.data?.records);
  return raw;
};

export const getById = async (tableName = null, id = -1) => {
  if (!id) throw Error(`id cannot be null or zero`);
  if (!tableName) throw Error(`tableName cannot be null or empty`);

  // let record = await get(tableName, id);
  let url = `https://api.airtable.com/v0/${baseKey}/Rewards/${id}`;

  const result = await axios({
    url,
    headers: {
      "Content-Type": "x-www-form-urlencoded",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  // console.log("result", result);

  return formatRecords(result?.data);
};

export const patch = async (tableName = null, records = []) => {
  if (!tableName) throw Error(`tableName cannot be null or empty`);
  // if (!record) throw Error(`record cannot be empty`);

  console.log("records received", records);

  // TODO: handle single values going in...
  let collection = [].concat(records);
  console.log("collection", collection);

  let formattedRecords = collection.map((r) => {
    const { id, ...rest } = r;
    return {
      id,
      fields: { ...rest },
    };
  });

  console.log("records to patch :>> ", formattedRecords);
  const data = {
    records: formattedRecords,
  };

  console.log("data patch :>> ", data);

  const url = `https://api.airtable.com/v0/${baseKey}/${tableName}`;
  let axiosConfig = {
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
  };

  console.log("url", url);
  console.log("data", data);
  const result = await axios.patch(url, data, axiosConfig);

  return formatRecords(result?.data?.records);
};

export const create = async (tableName = null, records = []) => {
  if (!records) throw Error(`record cannot be empty`);
  if (!tableName) throw Error(`tableName cannot be null or empty`);

  // console.log("record", record);
  const data = {
    records:
      records?.length >= 0
        ? records
        : [
            {
              // single record
              fields: records?.fields || { ...records },
            },
          ],
  };

  let url = `https://api.airtable.com/v0/${baseKey}/${tableName}`;
  let axiosConfig = {
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
  };
  const response = await axios.post(url, data, axiosConfig);

  // console.log("response", response);
  return formatRecords(response?.data?.records);
};

export const deleteRecord = async (tableName = null, id = null) => {
  if (!id) throw new Error(`id for record cannot be null!`);
  let url = `https://api.airtable.com/v0/${baseKey}/${tableName}/${id}`;
  console.log("url", url);
  let axiosConfig = {
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
  };
  const response = await axios.delete(url, axiosConfig);

  return response;
};
