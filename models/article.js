const mongoose = require('mongoose')

let Schema = mongoose.Schema

// article schema
let articleSchema = new Schema({
    title: String,
    author: String,
    body: String
})

// article model
let Article = mongoose.model('Article', articleSchema)

module.exports = Article