// Return a function that accepts a function and executes that function, but catches any errors and passes it to next()
// Wraps async functions

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}