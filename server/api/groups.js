import { User, Session, Group, Event } from '../schema.js';
import bcrypt from 'bcrypt';
import { handleInternalError, validateSession, validStr } from '../common.js';

export default function(app) {
    app.get('/group/search', async (req, res) => {
        try {
            let groupsFromDesc = await Group.find({ 
                $text: { $search: req.query.q }
            }).select('_id name').exec();
            let groupsFromName = await Group.find({
                $expr:{ $function: {
                    body: "function(name, q) { return name.toLowerCase().indexOf(q) > -1; }",
                    args: [ "$name", req.query.q.toLowerCase() ],
                    lang: 'js'
                } }
            }).select("_id name").exec();
            console.log(groupsFromDesc, groupsFromName);
            let groups = (groupsFromDesc||[]).concat(groupsFromName||[]);
            res.send(groups);
        } catch(err) {
            return handleInternalError(err, res);
        }
    });

    app.get('/group/:id', async (req, res) => {
        try {
            if(req.params.id === 'undefined') {
                return res.sendStatus(400);
            }
            let group = (await Group.findById(req.params.id)
                .populate({ path: 'members', select: ['_id', 'name', 'profilePicture'] })
                .populate({ path: 'events', populate: { path: 'creator', select: ['name','profilePicture','_id']}})
                .exec());

            if(group == null) {
                return res.sendStatus(404);
            }

            group = group.toObject();
            for(var e of group.events) {
                e.groupName = group.name;
                e.groupId = group._id;
            }
            console.log(group);
            res.send(group);
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
                description: req.body.desc,
                image: req.body.image,
                events: [],
                members: [user._id],
                owner: user._id,
            });
            console.log('new group: ', group);
            console.log('id: ' + group._id.valueOf());

            res.send(group._id.valueOf());
        } catch(err) {
            return handleInternalError(err, res);
        }
    });

    app.delete('/group/:id', async (req, res) => {
        try {
            const user = await validateSession(req);
            const group = await Group.findById(req.params.id).exec();

            console.log(user._id, group.owner);
            if (user._id.toString() === group.owner.toString()) {
                await group.remove();
            }

            res.sendStatus(200);
        } catch(err) {
            return handleInternalError(err, res);
        }
    });

    app.post('/group/:id/events/new', async (req, res) => {
        try {
            const user = await validateSession(req);
            const group = await Group.findById(req.params.id).exec();
            /*if(!group.members.id(user._id)) {
                return res.send(401);
            }*/

            const event = await Event.create({
                title: req.body.title,
                creator: user._id,
                datetime: req.body.date,
                description: req.body.desc,
                image: req.body.image
            });
            group.events.push(event);
            await group.save();
            const event_resp = {
                ...(await Event.findById(event._id).populate('creator').exec()).toObject(),
                groupName: group.name,
                groupId: group._id
            };
            console.log(event_resp);

            res.send(event_resp);
        } catch(err) {
            return handleInternalError(err, res);
        }
    });

    app.put('/group/:group_id/events/:event_id', async (req, res) => {
        try {
            const group = await Group.findById(req.params.group_id).exec();
            const event = group.events.id(req.params.event_id);

            if(req.body.title) event.title = req.body.title;
            if(req.body.date) event.datetime = req.body.date;
            if(req.body.desc) event.description = req.body.desc;
            if(req.body.image) event.image = req.body.image;

            await group.save();
            res.sendStatus(200);
        } catch (err) {
            return handleInternalError(err, res);
        }
    });

    app.delete('/group/:group_id/events/:event_id', async (req, res) => {
        try {
            const group = await Group.findById(req.params.group_id).exec();
            group.events.pull(req.params.event_id);

            await group.save();
            res.sendStatus(200);
        } catch (err) {
            return handleInternalError(err, res);
        }
    });

    app.get('/group/:id/members', async (req, res) => {
        try {
            const group = await Group.findById(req.params.group_id)
                .populate({ path: 'members', select: ['_id', 'name', 'profilePicture'] })
                .exec();
            res.send(group.members.toObject());
        } catch (err) {
            return handleInternalError(err, res);
        }
    });

    app.put('/group/:id/members', async (req, res) => {
        try {
            const user = await validateSession(req);
            const group = await Group.findById(req.params.id).exec();
            group.members.push(user._id)
            await group.save();
            res.sendStatus(200);
        } catch (err) {
            return handleInternalError(err, res);
        }
    });

    app.delete('/group/:id/members', async (req, res) => {
        try {
            const user = await validateSession(req);
            const group = await Group.findById(req.params.id).exec();
            console.log(group.members, Object.keys(group.members));
            group.members.remove(user._id);
            await group.save();
            res.sendStatus(200);
        } catch (err) {
            return handleInternalError(err, res);
        }
    });
}
