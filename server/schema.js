import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    emailAddress: String,
    name: String,
    password: String,
    profilePicture: String,
});
// TODO: users should be unique, but there doesn't seeem like there is an easy way to do this??
export const User = mongoose.model('User', userSchema);

const eventSchema = new Schema({
    title: String,
    creator: { type: Schema.Types.ObjectId, ref: 'User' },
    datetime: Date,
    description: String,
    image: String
});
export const Event = mongoose.model('Event', eventSchema);

const groupSchema = new Schema({
    name: String,
    description: { type: String, text: true },
    image: String,
    events: [eventSchema],
    members: [{type: Schema.Types.ObjectId, ref: 'User'}],
    owner: { type: Schema.Types.ObjectId, ref: 'User' }
});
export const Group = mongoose.model('Group', groupSchema);

const sessionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    expireAt: { type: Date, expires: 604800 /*one week*/ }
});
export const Session = mongoose.model('Session', sessionSchema);
