const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const headers = require('./headers');
const errorHandler = require('./errorHandler');
const Room = require('./models/room');

dotenv.config({path: "./config.env"});


const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB)
	.then(() => {
		console.log('connected to db');
	})
	.catch((err) => {
		console.log('connection failed', err);
	});

	const requestListener = async (req, res) => {
		let body = '';
		req.on('data', (chunk) => {
			body += chunk;
		});
		const urlParams = req.url.split('/');
		console.log('urlParams', urlParams);
		
		if (req.url === '/rooms' && req.method === 'GET') {
			const data = await Room.find();
			res.writeHead(200, headers);
			res.write(JSON.stringify({
				"status": "success",
				"data": data
			}));
			res.end();
		} else if (req.url === '/rooms' && req.method === 'POST') {
			req.on('end', async () => {
				try {
					const data = JSON.parse(body);
					await Room.create({
						name: data.name,
						price: data.price,
						rating: data.rating
					});
					res.writeHead(200, headers);
					res.write(JSON.stringify({
						"status": "success",
						"message": "room created",
						"data": data
					}));
					res.end();
					
				} catch (err) {
					errorHandler(res, err);
				}
				
			})
		} else if (req.url === '/rooms' && req.method === 'DELETE') {
			try {
				await Room.deleteMany({});
				res.writeHead(200, headers);
				res.write(JSON.stringify({
					"status": "success",
					"message": "all rooms deleted",
					"rooms": []
				}));
				res.end();
			} catch (err) {
				res.writeHead(400, headers);
				res.write(JSON.stringify({
					"status": "false",
					"message": "無法刪除所有房間",
					"error": err.message
				}));
			}
		} else if (req.url.startsWith('/rooms/') && req.method === 'DELETE') {
			const id = urlParams[2];
			try {
				await Room.findByIdAndDelete(id);
				res.writeHead(200, headers);
				res.write(JSON.stringify({
					"status": "success",
					"message": "room deleted",
					"id": id
				}))
				res.end();
			} catch (err) {
				errorHandler(res, err);
			}
		} else if (req.url.startsWith('/rooms/') && req.method === 'PATCH') {
			const id = urlParams[2];
			req.on('end', async() => {
				const data = JSON.parse(body);
				console.log('98', data);
				await Room.findByIdAndUpdate(id, data);
				res.writeHead(200, headers);
				res.write(JSON.stringify({
					"status": "success",
					"message": "room updated",
					"data": data
				}));
				res.end();
			})
		} else if (req.method === 'OPTIONS') {
			res.writeHead(200, headers);
			res.end();
		} else {
			res.writeHead(404, headers);
			res.write(JSON.stringify({
				"status": "false",
				"message": "無此路徑"
			}));
			res.end();
		}
		
	};

const server = http.createServer(requestListener);
server.listen(3005);