// Compatibility entry point for the selected exercise file.
const app = require('./server');
const PORT = Number(process.env.PORT || 3003);

app.listen(PORT, () => {
	console.log(`Daily Challenge API is running at http://localhost:${PORT}`);
});
