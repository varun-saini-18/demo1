const { validator } = require('../utils')
const connection = require('../dbService.js')

const createBook = async function (req, res) {
    try {

        const requestBody = req.body;

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide book details' })
            return
        }

        const { title, story } = requestBody;

        if (!validator.isValid(title)) {
            res.status(400).send({ status: false, message: 'Title is required' })
            return
        }

        if (!validator.isValid(story)) {
            res.status(400).send({ status: false, message: 'Story is required' })
            return
        }

        await new Promise((resolve,reject)=>{
            query = "INSERT INTO books (title,story,author,likes) VALUES (?,?,?,?)";
            connection.query(query,[title, story, req.user.userId, 0],(err,result)=>{
              if(err) reject(new Error(err));
              resolve(result);
            })
        });
          
        res.status(201).send({ status: true, message: `Success` });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const listBooks = async function (req, res) {
    try {
        const sorting_order = req.query.sorting_order ? req.query.sorting_order : 'asc'
        const sorting_field = req.query.sorting_field ? req.query.sorting_field : 'likes'
        const offset = req.query.page ? req.query.page : 0
        const allBooks = await new Promise((resolve,reject)=>{
            query = "Select * from books order by ? ? limit 10 offset ?";
            connection.query(query,[sorting_field, sorting_order, offset],(err,result)=>{
                if(err) reject(new Error(err));
                resolve(result);
            })
        });
        res.status(201).send({ status: true, message: `Success`, data: allBooks });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const getBookById = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const Book = await new Promise((resolve,reject)=>{
            query = "Select * from books where id = ?";
            connection.query(query,[bookId],(err,result)=>{
              if(err) reject(new Error(err));
              resolve(result);
            })
        });
        res.status(201).send({ status: true, message: `Success`, data: Book });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}



const deleteBookByID = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const Book = await new Promise((resolve,reject)=>{
            query = "Select author from books where id = ?";
            connection.query(query,[bookId],(err,result)=>{
              if(err) reject(new Error(err));
              resolve(result);
            })
        });
        console.log(Book[0].author)
        if(Book.length==0)
        {
            res.status(201).send({ status: false, message: `Sorry but book does not exist` });
        }
        else if (Book.length && Book[0].author != req.user.userId)
        {
            res.status(201).send({ status: false, message: `Sorry but you dont have rights to delete this book` });
        }
        else
        {
            await new Promise((resolve,reject)=>{
                query = "Delete from books where id = ?";
                connection.query(query,[bookId],(err,result)=>{
                  if(err) reject(new Error(err));
                  resolve(result);
                })
            });
            res.status(201).send({ status: true, message: `Success` });
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = {
    createBook,
    listBooks,
    getBookById,
    deleteBookByID
}

