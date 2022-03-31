import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button }  from 'react-bootstrap';
import { useGroupData } from './Data.js';
import { EventForm } from './NewEventModal.js';
import './styles/feed.css'

export function EventEditModal({visible, handleClose, event}) {
    const f = usePlainData({
        title: event.title,
        date: event.date,
        desc: event.desc
    });

    const finish = useCallback(() =>
        event.edit(f.title, new Date(f.date), f.desc)
        .then(() => {
            f.clear();
            handleClose()
        })
    );

    return (
        <Modal show={visible} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit event</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <EventForm formData={f}/>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary"
                    disabled={f.title.trim().length == 0 || f.date.trim().length == 0 || f.desc.trim().length == 0}
                    onClick={finish}>Save</Button>
            </Modal.Footer>
        </Modal>
    );
}

function FeedEvent({event}) {
    const groupInfo = useGroupData(event.groupId);
    const event = useEventData(event.id);

    const [editModalVis, setEditModalVis] = useState(false);

    const editEvent = useCallback(() => {
        setEditModalVis(true);
    });

    const deleteEvent = useCallback(() => {
        if(userIsOwner || user.id == event.creator) {
            event.delete();
        }
    });

    return (<>
        <EventEditModal visible={editModalVis} handleClose={() => setEditModalVis(false)}
            event={event}/>
        <div className="event accent-shade-border">
            <div className="header main-tint-fg accent-tint-bg">
                <span>{event.title}</span>
                <span className="emdash">&mdash;</span>
                <span className="group-name">{groupInfo.name}</span>
                <Button size="sm" onClick={editEvent}>✎</Button>
                <Button size="sm" onClick={deleteEvent}>╳</Button>
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
    </>);
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
