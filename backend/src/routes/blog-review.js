import blogControllers from '../controllers/blogs-reviews/blogs.js';
import blogMiddlewares from '../middlewares/blogs-reviews/blogs.js';
import express from 'express';
import ProtectMiddleware, {isJournalist} from '../middlewares/general/protect.js';

const blogrouter = express.Router();

blogrouter.post('/', ProtectMiddleware, isJournalist, blogMiddlewares.CreateBlogMiddleware, blogControllers.CreateBlogController);
blogrouter.get('/', blogControllers.ListBlogsController);
blogrouter.put('/:id', ProtectMiddleware, isJournalist, blogMiddlewares.UpdateBlogMiddleware, blogControllers.UpdateBlogController);
blogrouter.delete('/:id', ProtectMiddleware, isJournalist, blogMiddlewares.DeleteBlogMiddleware, blogControllers.DeleteBlogController);

export default {blogrouter};