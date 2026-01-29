import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ConfigureMessages, ErrorHandler } from '@gerync/utils2';
import config from '../../config.json' assert { type: 'json' };
const app = express();

// #region Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());


const confPayload = {
    lang: 'hu',
    OnDupe: '$f már létezik!',
    
    NoDupesAllowedOf: ['Email','HashedEmail', 'MobileNumber', 'HashedMobileNumber' ]
};
ConfigureMessages(confPayload);
// #endregion

// #region Routers



// #endregion

// #region Start Server
const PORT = config.server.port;
app.listen(PORT, () => {
    console.log(`${PORT}-on elindult a szerver!`);
});
// #endregion
app.use(ErrorHandler);