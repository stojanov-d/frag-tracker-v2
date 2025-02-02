import CustomClient from './client/CustomClient';
import ExpressServer from './express/ExpressServer';

const client = new CustomClient();
client.Init();

const express = new ExpressServer();
express.start(3000);
