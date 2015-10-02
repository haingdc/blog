var mongodb = require('./db')

function User (user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};

module.exports = User;

// lưu thông tin người dùng
User.prototype.save = function (callback) {
	// đây là thông tin người dùng
	var user = {
		name: this.name,
		password: this.password,
		email: this.email
	};
	// mở kết nối tới cơ sở dữ liệu
	mongodb.open(function (err, db) {
		if (err)
			return callback(err);	// gặp lỗi, trở lại err
		// đọc collection users
		db.collection('users', function (err, collection) {
			if (err) {
				mongodb.close()
				return callback(err)	// gặp lỗi, trở lại thông tin của lỗi
			}
			// thêm một người dùng vào collection users
			collection.insert(user, {
				safe: true
			}, function (err, user) {
				mongodb.close()
				if (err)
					return callback(err)	// gặp lỗi, trở lại thông tin của lỗi
				callback(null, user.ops[0])	// thành công! err chứa null, trở lại document user sau khi thêm
			})
		})
	})
};

// Đọc thông tin người dùng
User.get = function (name, callback) {
	// mở kết nối tới cơ sở dữ liệu
	mongodb.open(function (err, db) {
		if (err)
			return callback(err)	// gặp lỗi, trở lại thông tin của lỗi
		// đọc collection users
		db.collection('users', function (err, collection) {
			if (err) {
				mongodb.close()
				return callback(err)	// gặp lỗi, trở lại thông tin của lỗi
			}
			// tìm tên người dùng
			collection.findOne({
				name: name
			}, function (err, user) {
				mongodb.close()
				if (err)
					return callback(err)	// không thành công! trở lại thông tin của lỗi
				callback(null, user)	// thành công! trở lại thông tin người dùng
			})
		})
	})
};