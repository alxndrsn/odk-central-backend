
module.exports = (service, endpoint) => {
	service.get('/oidc/1', (req, res, next) => {
		res.send('helo');
	});
};
