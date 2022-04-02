import { useMemo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal }  from 'react-bootstrap';
import { useGroupData, usePlainData, api } from './Data.js';
import { EditEventModal } from './NewEventModal.js';
import './styles/feed.css'


function FeedEvent({event, data, dispatch}) {
    const [editModalVis, setEditModalVis] = useState(false);

    const editEvent = useCallback(() => {
        setEditModalVis(true);
    });

    const deleteEvent = useCallback(() => {
        if(data.profile._id == event.creator._id) {
            dispatch(api.events.delete(event._id), event.groupId);
        }
    });

    return (<>
        <EditEventModal visible={editModalVis} handleClose={() => setEditModalVis(false)}
            event={event} dispatch={dispatch}/>
        <div className="event accent-shade-border">
            <div className="header main-tint-fg accent-tint-bg">
                <div>
                    <span>{event.title}</span>
                    <span className="emdash">&mdash;</span>
                    <span className="group-name">{event.groupName}</span>
                </div>
                <div>
                    <Button style={{margin: '0.2rem'}} size="sm" variant="outline-dark" onClick={editEvent}>✎</Button>
                    <Button style={{margin: '0.2rem'}} size="sm" variant="outline-dark" onClick={deleteEvent}>X</Button>
                </div>
            </div>

        <div className="info">
            {event.datetime.toLocaleString()}
            <span className="profile-sm text-gray">{event.creator.name}
                {event.creator.profilePicture && <img src={event.creator.profilePicture}/>}
            </span>
        </div>

        {event.imgSrc && <img className="event-img" src={event.image}/>}
        <p className="desc">{event.description}</p>
        </div>
    </>);
}

// TODO: move create event modal instance into the Feed, maybe move the edit event modal into the create event modal file though?

export function Feed({events, showCreateEvent, data, dispatch}) {
    // console.log(events);
    const sortedEvents = useMemo(() => events.sort((a,b) => a.datetime.getTime()-b.datetime.getTime()), [events]);

    return (
        <div className="col feed">
            {showCreateEvent &&
                <div className="event accent-shade-border">
                    <Button onClick={showCreateEvent} className="main-tint-fg accent-tint-bg" style={{padding: '0.1rem'}}>
                        Create new event...
                    </Button>
                </div>}
            {events.length != 0 ? sortedEvents.map((event) => <FeedEvent event={event} key={event?._id} data={data} dispatch={dispatch}/>) : <i>No events</i>}
        </div>
    );
}
