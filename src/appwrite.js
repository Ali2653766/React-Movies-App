import { Client, Databases, ID, Query } from 'appwrite'

const PROJECT_ID = '683f42f4002306a920bc';
const DATABASE_ID = '683f45bb0008c1cf0128';
const COLLECTION_ID = '683f45f000050f2c3f9e';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm),
    ]);

    // تحقق أن النتيجة موجودة وأن documents مصفوفة
    if (result && Array.isArray(result.documents) && result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      });
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count")
    ]);

    // تحقق أن النتيجة موجودة وأن documents مصفوفة
    if (result && Array.isArray(result.documents)) {
      return result.documents;
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};