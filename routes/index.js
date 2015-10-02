var crypto = require('crypto'),
	User   = require('../models/user.js'),
	Post   = require('../models/post.js')

module.exports = function (app) {
	app.get('/', function (req, res) {
		Post.get(null, function (err, posts) {
			if (err)
				posts = [];
			res.render('index', {
				title: 'Trang chủ',
				user: req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		})
	});
	app.get('/reg', checkNotLogin)
	app.get('/reg', function (req, res) {
		res.render('reg', {
			title: 'Đăng kí',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/reg', checkNotLogin)
	app.post('/reg', function (req, res) {
		var name        = req.body.name,
			password    = req.body.password,
			password_re = req.body['password-repeat']
		// hai mật khẩu phải giống nhau
		if (password_re != password) {
			req.flash('error', 'hai mật khẩu là không giống nhau!')
			return res.redirect('/reg')	// trở lại trang đăng kí
		}
		// mã hóa mật khẩu bằng md5
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex')
		var newUser = new User({
			name: name,
			password: password,
			email: req.body.email
		})
		// kiểm tra tên tài khoản đã tồn tại
		User.get(newUser.name, function (err, user) {
			if (err) {
				req.flash('error', err)
				return res.redirect('/')
			}
			if (user) {
				req.flash('error', 'Tên tài khoản đã được sử dụng!')
				return res.redirect('/reg')	// trở lại trang đăng kí
			}
			// thêm mới tài khoản
			newUser.save(function (err, user) {
				if (err) {
					req.flash('error', err)
					return res.redirect('/reg')	// gặp lỗi, trở lại trang đăng kí
				}
				req.session.user = user 	// thông tin lưu vào session
				req.flash('success', 'đăng kí thành công!')
				res.redirect('/')	// trở về trang chủ
			})
		})
	});
	app.get('/login', checkNotLogin)
	app.get('/login', function (req, res) {
		res.render('login', {
			title: 'Đăng nhập',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/login', checkNotLogin)
	app.post('/login', function (req, res) {
		// mã hóa mật khẩu sử dụng md5
		var md5      = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		// kiểm tra tài khoản có tồn tại
		User.get(req.body.name, function (err, user) {
			if (!user) {
				req.flash('error', 'tài khoản không tồn tại!');
				return res.redirect('/login');	// tài khoản không tồn tại, chuyển tiếp sang trang đăng nhập
			}
			// 2 mật khẩu phải giống nhau
			if (user.password != password) {
				req.flash('error', 'mật khẩu không chính xác!');
				return res.redirect('/login');	// mật khẩu không chính xác, chuyển tiếp sang trang đăng nhập
			}
			// sau khi tên tài khoản và mật khẩu hợp lệ, thông tin người dùng được lưu vào session
			req.session.user = user;
			req.flash('success', 'Đăng nhập thành công!');
			res.redirect('/');	// Đăng nhập thành công, chuyển tiếp sang trang chủ
		})
	});
	app.get('/post', checkLogin)
	app.get('/post', function (req, res) {
		res.render('post', {
			title: 'Đăng bài viết',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/post', checkLogin)
	app.post('/post', function (req, res) {
		var currentUser = req.session.user,
				   post = new Post(currentUser.name, req.body.title, req.body.post)
		post.save(function (err) {
			if (err) {
				req.flash('error', err)
				return res.redirect('/')
			}
			req.flash('success', 'Bài viết đã được đăng thành công!')
			res.redirect('/')	// chuyển tiếp tới trang chủ
		})
	});
	app.get('/logout', checkLogin)
	app.get('/logout', function (req, res) {
		req.session.user = null;
		req.flash('success', 'Đăng xuất thành công!');
		res.redirect('/');	// Đăng xuất thành công, chuyển tiếp sang trang chủ
	});

	app.get('/upload', checkLogin)
	app.get('/upload', function (req, res) {
		res.render('upload', {
			title: 'Tải lên',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		})
	})

	app.post('/upload', checkLogin)
	app.post('/upload', function (req, res) {
		req.flash('success', 'Tập tin đã tải lên thành công!')
		res.redirect('/upload')
	})

	function checkLogin (req, res, next) {
		if (!req.session.user) {
			req.flash('error', 'Bạn chưa đăng nhập!')
			res.redirect('/login')
		}
		next()
	}

	function checkNotLogin (req, res, next) {
		if (req.session.user) {
			req.flash('error', 'Bạn đã đăng nhập!')
			res.redirect('back')	// chuyển tiếp sang trang trước
		}
		next()
	}
};
