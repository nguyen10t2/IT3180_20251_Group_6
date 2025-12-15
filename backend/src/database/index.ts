import { Elysia } from 'elysia';
import { db } from './db';

export const pluginDB = new Elysia().decorate('db', db);