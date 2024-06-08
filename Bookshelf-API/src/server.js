const Hapi = require('@hapi/hapi');
const { getAllBooksHandler, getBookByIdHandler, addBookHandler, editBookByIdHandler, deleteBookByIdHandler } = require('./books.js');

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost'
  });

  server.route([
    { method: 'GET', path: '/books', handler: getAllBooksHandler },
    { method: 'GET', path: '/books/{id}', handler: getBookByIdHandler },
    { method: 'POST', path: '/books', handler: addBookHandler },
    { method: 'PUT', path: '/books/{id}', handler: editBookByIdHandler },
    { method: 'DELETE', path: '/books/{id}', handler: deleteBookByIdHandler }
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init().catch(err => {
  console.error(err);
  process.exit(1);
});
