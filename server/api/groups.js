import { User, Session, Group, Event } from '../schema.js';
import bcrypt from 'bcrypt';
import { handleInternalError, validateSession, validStr } from '../common.js';

export default function(app) {
    app.get('/group/:id', (req, res) => {
        try {
            const group = Group.findById(req.params.id);
            res.send({
                group
            });
        } catch(err) {
            return handleInternalError(err, res);
        }
    });

    app.post('/group/new', async (req, res) => {
        if(!validStr(req.body.name)) return res.sendStatus(400);
        try {
            const user = await validateSession(req);
            const group = await Group.create({
                name: req.body.name,
                description: req.body.description,
                image: req.body.image,
                events: [],
                members: [user._id],
                owner: user._id,
            });

            res.send(group._id);
        } catch(err) {
            return handleInternalError(err, res);
        }
    });

    app.delete('/group/:id', async (req, res) => {
        const user = await validateSession(req);
        const group = Group.findById(req.params.id);

        if (user._id == group.owner) {
            Group.findByIdAndDelete(req.params.id);
        }

        res.sendStatus(200);
    });

    // app.get('/group/:id/events', async (req, res) => {});
        
    app.post('/group/:id/new', async (req, res) => {
        try {
            const user = await validateSession(req);
            const group = Group.findById(req.params.id); 
            const event = await Event.create({
                title: req.body.title,
                creator: user._id,
                datetime: req.body.datetime,
                description: req.body.description,
                image: req.body.image
            });

            group.events.push(event);
            await group.save();
            res.send(200);
        } catch(err) {
            return handleInternalError(err, res);
        }
    });

    app.put('/group/:group_id/events/:event_id', async (req, res) => {
        try {
            const group = Group.findById(req.params.group_id);
            const event = group.events.id(req.params.event_id);

            event.title = req.body.title;
            event.datetime = req.body.datetime;
            event.description = req.body.description;
            event.image = req.body.image;

            await group.save();
            res.send(200);
        } catch (err) {
            return handleInternalError(err, res);
        }
    });

    app.delete('/group/:group_id/events/:event_id', async (req, res) => {
        try {
            const group = Group.findById(req.params.group_id);
            group.events.pull(req.params.event_id);

            await group.save();
            res.send(200);
        } catch (err) {
            return handleInternalError(err, res);
        }
    });

    app.get('/group/:id/members', async (req, res) => {
        try {
            const group = Group.findById(req.params.group_id);
            
            res.send(group.members);
        } catch (err) {
            return handleInternalError(err, res);
        }
    });

    app.put('/group/:id/members', async (req, res) => {
        try {
            const group = Group.findById(req.params.id);
            const user = await validateSession(req);
            group.members.push(user)
            res.send(200);
        } catch (err) {
            return handleInternalError(err, res);
        }
    });

    app.delete('/group/:id/members', async (req, res) => {
        try {
            const group = Group.findById(req.params.id);
            group.members.pull(await validateSession(req)._id);
            res.send(200);
        } catch (err) {
            return handleInternalError(err, res);
        }
    });
}