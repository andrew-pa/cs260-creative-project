import { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useGroupData } from './Data.js';
import './styles/feed.css'

function FeedEvent({event}) {
    const groupInfo = useGroupData(event.groupId);

    return (
        <div className="event accent-shade-border">
            <div className="header main-tint-fg accent-tint-bg">
                <span>{event.title}</span>
                <span className="emdash">&mdash;</span>
                <span className="group-name">{groupInfo.name}</span>
            </div>

        <div className="info">
            {event.date.toLocaleString()}
            <span className="profile-sm text-gray">{event.author.name}
                {event.author.avatarSrc && <img src={event.author.avatarSrc}/>}
            </span>
        </div>

        {event.imgSrc && <img className="event-img" src={event.imgSrc}/>}
        <p className="desc">{event.desc}</p>
        </div>
    );
}

export function Feed({events, showCreateEvent}) {
    const sortedEvents = useMemo(() => events.sort((a,b) => a.date.getTime()-b.date.getTime()), [events]);

    return (
        <div className="col feed">
            {showCreateEvent &&
                <div className="event accent-shade-border">
                    <Button onClick={showCreateEvent} className="main-tint-fg accent-tint-bg" style={{padding: '0.1rem'}}>
                        Create new event...
                    </Button>
                </div>}
            {events.length != 0 ? sortedEvents.map((event) => <FeedEvent event={event} key={event.id}/>) : <i>No events</i>}
        </div>
    );
}
