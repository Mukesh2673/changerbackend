const algoliasearch = require("algoliasearch");
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);

exports.saveAlgolia = async (records, index) => {
  try {
    const algoliaIndex = client.initIndex(index);
    return await algoliaIndex.saveObjects(
      records,
      { autoGenerateObjectIDIfNotExist: true },
      (err, content) => {
        if (err) {
          return err;
        }
        return content;
      }
    );
  } catch (err) {
    console.log("valeu of err", err);
  }
};

exports.searchAlgolia = async (query) => {
  try {
    var queries = [];
    if (query.type && query.type !== "hashtags") {
      queries = [
        {
          indexName: query.type,
          query: query.search,
        },
      ];
    } else {
      queries = [
        {
          indexName: "users",
          query: query.search,
        },
        {
          indexName: "campaigns",
          query: query.search,
        },
        {
          indexName: "impacts",
          query: query.search,
        },
        {
          indexName: "videos",
          query: query.search,
        },
        {
          indexName: "issues",
          query: query.search,
        },
      ];
    }
    if (query.location) {
      const targetLatitude = parseFloat(query.location[0].lat);
      const targetLongitude = parseFloat(query.location[0].lng);
      const searchRadius = 10000;
      for (let i = 0; i < queries.length; i++) {
        queries[i].aroundLatLng = `${targetLatitude},${targetLongitude}`;
        queries[i].aroundRadius = searchRadius;
      }
    }

    if (query.hashtags){
      const hashtags = `hashtags:${query.hashtags}`;
      for (let i = 0; i < queries.length; i++) {
        queries[i].facetFilters = [`${hashtags}`];
        delete queries[i].query;
      }
    }
    if (query.cause) {
      let cause=query.cause
      let causeFilter=[]
      if(Array.isArray(cause))
      {
         causeFilter = cause.map(data => `cause:${data}`);
      }
      else{
         causeFilter = [`cause:${cause}`];

      }
      for (let i = 0; i < queries.length; i++) {
        queries[i].facetFilters = [causeFilter];
      }
    }
    const { results } = await client.multipleQueries(queries);
    let records=results
    .filter(result => result.hits.length > 0)
    .map((result, index) => ({
      data: result.hits.map(hit => {
        delete hit._highlightResult;
        return hit;
      }),
    }));
    return records?.length>0 ?  records[0]?.data: records
  } catch (error) {
    console.log("err is", error);
    return error;
  }
};
exports.updateAlgolia = async (objects, index) => {
  try {
    const algoliaIndex = client.initIndex(index);

    return await algoliaIndex
      .partialUpdateObject(objects, {
        createIfNotExists: true,
      })
      .then(({ hits }) => {
        return hits;
      });
  } catch (error) {
    console.log("err is", error);
    return error;
  }
};
exports.deleteAlgolia = async (index) => {
  try {
    const algoliaIndex = client.initIndex(index);
    return await algoliaIndex.deleteObjects(index).then((objectId) => objectId);
  } catch (err) {
    console.log("err is", err);
  }
};
exports.findObjectById = async (objectId, indexName) => {
  try {
    const index = client.initIndex(indexName); // Initialize the index

    const object = await index.getObject(objectId); // Retrieve the object by its objectID

    return [object]; // Return the object
  } catch (error) {
    console.log("Error:", error);
    return error;
  }
};
