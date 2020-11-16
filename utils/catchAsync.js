// Async wrapper function to catch and pass errors to next()
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}