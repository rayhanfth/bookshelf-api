const Joi = require('joi');

const booksData = [];

const addBookHandler = (request, h) => {
  try {
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

    const schema = Joi.object({
      name: Joi.string().required(),
      year: Joi.number().integer().min(1000).max(new Date().getFullYear()).required(),
      author: Joi.string().required(),
      summary: Joi.string().required(),
      publisher: Joi.string().required(),
      pageCount: Joi.number().integer().min(1).required(),
      readPage: Joi.number().integer().min(0).max(Joi.ref('pageCount')).required(),
      reading: Joi.boolean().required()
    });

    const { error } = schema.validate(request.payload);
    if (error) {
      if (error.details[0].context.key === 'name') {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku'
        }).code(400);
      } else if (error.details[0].context.key === 'readPage' && error.details[0].type === 'number.max') {
        return h.response({
          status: 'fail',
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
        }).code(400);
      } else {
        return h.response({
          status: 'fail',
          message: error.details[0].message
        }).code(400);
      }
    }

    const id = Date.now().toString();
    const finished = pageCount === readPage;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt
    };

    booksData.push(newBook);

    return h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id
      }
    }).code(201);
  } catch (error) {
    console.error('Error:', error);
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan saat menambahkan buku'
    }).code(500);
  }
};


const getAllBooksHandler = (request, h) => {
  const { query } = request;

  let filteredBooks = [...booksData];

  if (query.name) {
    const searchName = query.name.toLowerCase();
    filteredBooks = filteredBooks.filter((book) =>
      book.name.toLowerCase().includes(searchName),
    );
  }

  if (query.reading !== undefined) {
    const readingValue = query.reading === '1';
    filteredBooks = filteredBooks.filter((book) => book.reading === readingValue);
  }

  if (query.finished !== undefined) {
    const finishedValue = query.finished === '1';
    filteredBooks = filteredBooks.filter((book) => book.finished === finishedValue);
  }

  const response = {
    status: 'success',
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  };

  return h.response(response).code(200);
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const book = booksData.find((n) => n.id === id);

  if (book) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  return h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  }).code(404);
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }

  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  const index = booksData.findIndex((book) => book.id === id);

  if (index !== -1) {
    const updatedAt = new Date().toISOString();
    booksData[index] = {
      ...booksData[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished: pageCount === readPage,
      reading,
      updatedAt,
    };

    return h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  }).code(404);
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const index = booksData.findIndex((book) => book.id === id);

  if (index !== -1) {
    booksData.splice(index, 1);
    return h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  }).code(404);
};

module.exports = {
  getAllBooksHandler,
  getBookByIdHandler,
  addBookHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
