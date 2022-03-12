import React from 'react';
import { Link } from 'react-router-dom';
import { useUserEvents } from './Data.js';
import './styles/feed.css'

function FeedEvent({event}) {
    return (
        <div className="event accent-shade-border">
            <div className="header main-tint-fg accent-tint-bg">
                <span>{event.title}</span>
                    &mdash;
                <span className="group-name">{event.groupId}</span>
            </div>

        <div className="info">
            {event.date.toString()}
            <span className="profile-sm text-gray">{event.author.name}
                {event.author.avatarSrc && <img src={event.author.avatarSrc}/>}
            </span>
        </div>

        {event.imgSrc && <img src={event.imgSrc}/>}
        <p className="desc">{event.desc}</p>
        </div>
    );
}

export function Feed({events}) {
    return (
        <div className="col feed">
            {events.length != 0 ? events.map((event) => <FeedEvent event={event} key={event.id}/>) : <p>No events!</p>}
        </div>
    );
}