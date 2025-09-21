const app = require('./app');
const connectDB = require('./lib/db');
const { port } = require('./config');

connectDB().then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
});
