const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const config = require('../config/database')

module.exports = passport => {
    // local strategy
    passport.use(new localStrategy((username, password, done) => {
        // match username
        let query = {username}
        User.findOne(query, (err, user) => {
            if (err) {
                return done(err)
            }
            if (!user) {
                return done(null, false, {message: 'Incorrect username.'})
            }
            // match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return done(err)
                }
                if (isMatch) {
                    return done(null, user)
                } else {
                    return done(null, false, {message: 'Incorrect password.'})
                }
            })
        })
    }))
    passport.serializeUser((user, done) => done(null, user.id))

    passport.deserializeUser((id, done) => 
        User.findById(id, (err, user) => done(err, user)))
}