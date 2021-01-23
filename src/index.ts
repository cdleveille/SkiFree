import config from './helpers/config';
import path from 'path';
import express, { Request, Response } from 'express';
import app from './controllers/index';
import { cwd } from 'process';
import log from './services/logger';
import errorHandler from './middleware/errorHandler';

const http = require('http').Server(app);
export const io = require('socket.io')(http);

app.use(express.static(path.join(cwd(), (config.IS_COMPILED ? './public.min/' : './public/'))));
app.set('view engine', 'ejs');
app.set('views', path.join(cwd(), (config.IS_COMPILED ? './public.min/' : './public/')));

// serve static
app.get('/', async (req: Request, res: Response): Promise<void> => {
	return res.status(200).render('ski.ejs');
});
app.get('/websocket-client', async (req: Request, res: Response): Promise<void> => {
	return res.status(200).sendFile(`${cwd()}/node_modules/socket.io/client-dist/socket.io.js`);
});
// wildcard handler
app.get('*', async (req: Request, res: Response): Promise<Response> => {
	return res.status(404).send('404 not found');
});

// this must be referenced last
app.use(errorHandler);

const start = async (): Promise<void> => {
	http.listen(config.PORT, () => {
		log.info(`${config.ENV} server started http://localhost:${config.PORT}`);
	});
};

start();