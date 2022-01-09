const { validator, jwt } = require('../utils')
const connection = require('../dbService.js')


const registerUser = async function (req, res) {
    try {
        const requestBody = req.body;
        
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' })
            return
        }

        const { name, contact_number, email, password, address } = requestBody;

        if (!validator.isValid(name)) {
            res.status(400).send({ status: false, message: 'name is required' })
            return
        }

        if (!validator.isValid(contact_number)) {
            res.status(400).send({ status: false, message: 'contact_number is required' })
            return
        }

        if (!validator.isValidNumber(contact_number)) {
            res.status(400).send({ status: false, message: 'Invalid contact_number number' })
            return
        }

        const isPhoneAlreadyUsed = await new Promise((resolve,reject)=>{
            query = "Select id from users where contact_number = ? limit 1";
            connection.query(query,[contact_number],(err,result)=>{
              if(err) reject(new Error(err));
              resolve(result);
            })
        });

        if (isPhoneAlreadyUsed.length) {
            res.status(400).send({ status: false, message: `${contact_number} is already registered` })
            return
        }

        if (!validator.isValid(email)) {
            res.status(400).send({ status: false, message: `Email is required` })
            return
        }

        if (!validator.validateEmail(email)) {
            res.status(400).send({ status: false, message: `Invalid email address` })
            return
        }

        const isEmailAlreadyUsed = await new Promise((resolve,reject)=>{
            query = "Select id from users where email = ? limit 1";
            connection.query(query,[email],(err,result)=>{
              if(err) reject(new Error(err));
              resolve(result);
            })
        });

        if (isEmailAlreadyUsed.length) {
            res.status(400).send({ status: false, message: `${email} email address is already registered` })
            return
        }

        if (!validator.isValid(password)) {
            res.status(400).send({ status: false, message: `Password is required` })
            return
        }

        if (!validator.passwordLength(password)) {
            res.status(400).send({ status: false, message: `Password length should be 8 - 15 characters` })
            return
        }

        const newUser = await new Promise((resolve,reject)=>{
            query = "INSERT INTO users (name,contact_number,email,password,address) VALUES (?,?,?,?,?)";
            connection.query(query,[name,contact_number,email,password,address],(err,result)=>{
              if(err) reject(new Error(err));
              resolve(result);
            })
        });
          
        res.status(201).send({ status: true, message: `Success`, data: newUser });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const loginUser = async function (req, res) {
    try {
        const requestBody = req.body;
        if(!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({status: false, message: 'Invalid request parameters. Please provide login details'})
            return
        }

        const {email, password} = requestBody;
        
        if(!validator.isValid(email)) {
            res.status(400).send({status: false, message: `Email is required`})
            return
        }
        
        if(!validator.validateEmail(email)) {
            res.status(400).send({status: false, message: `Email should be a valid email address`})
            return
        }

        if(!validator.isValid(password)) {
            res.status(400).send({status: false, message: `Password is required`})
            return
        }

        const User = await new Promise((resolve,reject)=>{
            query = "Select id from users where email = ? and password = ?";
            connection.query(query,[email,password],(err,result)=>{
              if(err) reject(new Error(err));
              resolve(result);
            })
        });

        if(!User.length) {
            res.status(401).send({status: false, message: `Invalid login credentials`});
            return
        }

        const token = await jwt.createToken({userId: User[0].id});
        res.header('x-api-key', token);

        res.status(200).send({status: true, message: `success`, data: {token}});
    } catch (error) {
        res.status(500).send({status: false, message: error.message});
    }
}


module.exports = {
    registerUser,
    loginUser
}

