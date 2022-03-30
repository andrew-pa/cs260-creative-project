import { Session } from './schema.js';

export function handleInternalError(err, response) {
    console.log('error: ', err);
    response.sendStatus(500);
}

export function validStr(s) {
    return s && s.trim().length > 0;
}

export async function validateSession(req) {
    if(!validStr(req.cookies.session)) return null;
    const session = await Session.findById(req.cookies.session).populate('user').exec();
    return session ? session.user : null;
}
