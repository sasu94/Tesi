module.exports = {
    post: function(req, res) {
        console.log(req.body.nome + " " + req.body.num);
    }
}
