import config from '../../../config.json' assert { type: 'json' };

export default function logoutController(req, res) {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict'
    });
    res.clearCookie('publicRole', {
        httpOnly: false,
        secure: config.isProduction,
        sameSite: 'strict'
    });
    res.status(200).json({ message: 'Sikeres kijelentkezés!' });
}