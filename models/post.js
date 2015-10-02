var mongodb = require('./db')
	markdown = require('markdown').markdown

function Post (name, title, post) {
	this.name = name
	this.title = title
	this.post = post
}

module.exports = Post

// lưu bài viết và các thông tin liên quan
Post.prototype.save = function (callback) {
	var date = new Date()
	// lưu thời gian dưới dạng khác nhau, cho phép dễ dàng mở rộng trong tương lai
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " ",
		minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	}
	// để lưu bài viết vào cơ sở dữ liệu
	post = {
		name: this.name,
		time: time,
		title: this.title,
		post: this.post,
	}
	mongodb.open(function (err, db) {
		if (err)
			return callback(err)
		// đọc collection posts
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close()
				return callback(err)
			}
			// post collection để lưu bài viết
			collection.insert(post, {
				safe: true
			}, function (err) {
				mongodb.close()
				if (err)
					return callback(err)	// gặp lỗi! trở lại err
				callback(null)	// trở lại err có giá trị null
			})
		})
	})
}

// đọc ra bài viết và các thông tin có liên quan
Post.get = function (name, callback) {
	// kết nối với cơ sở dữ liệu
	mongodb.open(function (err, db) {
		if (err)
			return callback(err)
		// đọc collection posts
		db.collection('posts', function (err, collection) {
			if (err) {
				mongodb.close()
				return callback(err)
			}
			var query = {}
			if (name)
				query.name = name
			// dựa vào query, tìm kiếm các bài viết
			collection.find(query).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close()
				if (err)
					return callback(err)	// gặp lỗi! Trở lại err
				// chuyển đổi markdown sang html
				docs.forEach(function (doc) {
					doc.post = markdown.toHTML(doc.post)
				})
				callback(null, docs)	// thành công! Trở lại mảng các đối tượng bài viết
			})
		})
	})
}