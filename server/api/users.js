import { User, Session, Group } from '../schema.js';
import bcrypt from 'bcrypt';
import { handleInternalError, validateSession, validStr } from '../common.js';

async function getUserGroups(userId) {
    const groups = await Group.find({ members: userId }).exec();

    return groups.map(group => ({
        _id: group._id,
        name: group.name
    }));
}

async function createSessionResponse(user, res) {
    const session = await Session.create({ user: user._id });
    res.cookie('session', session._id, { maxAge: 604800000 /*one week in milliseconds*/ });
    res.send({
        id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
        groups: await getUserGroups(user._id)
    });
}

export default function(app) {
    app.post('/login', async (req, res) => {
        if(!validStr(req.body.emailAddress) || !validStr(req.body.password)) {
            return res.sendStatus(400);
        }
        try {
            const user = await User.findOne({emailAddress: req.body.emailAddress}).exec();
            if(await bcrypt.compare(req.body.password, user.password)) {
                return await createSessionResponse(user, res);
            } else {
                return res.sendStatus(401);
            }
        } catch(err) {
            return handleInternalError(err, res);
        }
    });

    app.post('/logout', async (req, res) => {
        if(validStr(req.cookies.session)) {
            await Session.deleteOne({_id: req.cookies.session});
            res.clearCookie('session');
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    });

    app.post('/register', async (req, res) => {
        if(!validStr(req.body.emailAddress) || !validStr(req.body.password) || !validStr(req.body.profilePicture) || !validStr(req.body.name)) {
            return res.sendStatus(400);
        }
        try {
            const passwordHash = await bcrypt.hash(req.body.password, 10);
            const user = await User.create({
                emailAddress: req.body.emailAddress,
                name: req.body.name,
                password: passwordHash,
                profilePicture: req.body.profilePicture
            });
            return await createSessionResponse(user, res);
        } catch(err) {
            return handleInternalError(err, res);
        }
    });

    app.get('/user', async (req, res) => {
        try {
            const user = await validateSession(req);
            if(!user) return res.send('invalid');

            res.send({
                id: user._id,
                name: user.name,
                profilePicture: user.profilePicture,
                groups: await getUserGroups(user._id)
            });
        } catch(err) {
            return handleInternalError(err, res);
        }
    });

    app.get('/user/events', async (req, res) => {
        try {
            const user = await validateSession(req);
            if(!user) return res.sendStatus(401);

            const groups = await Group.find({ members: user._id }).exec();
            
            res.send(groups.flatMap(group => group.events.map(e => ({groupId: group._id, ...e}))));
        } catch(err) {
            return handleInternalError(err, res);
        }
    });
}

