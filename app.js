var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var settings = require('./settings');
var flash = require('connect-flash');

var app = express();

app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,   // tên Cookie
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },   // Ứng với 30 ngày
    store: new MongoStore({
        db: settings.db,
        host: settings.host,
        port: settings.port
    })
}));

var multer = require('multer')

app.use(multer({
	dest: './public/images',
	rename: function (fieldname, filename) {
		return filename
	}
}))

// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(flash());
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // lúc nào đấy test xem ứng dụng có hoạt động k bằng cách comment dòn này
app.use(express.static(path.join(__dirname, 'public')));

routes(app);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
